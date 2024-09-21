import { IoClose } from "react-icons/io5";
import { useEffect, useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { bookmarkDataFetch } from "../../api/bookmark";
import { getBookmarks, saveBookmarks } from "../../hooks/useBookmarks";
import { bookmarkDataInterface, manageModalInterface } from "../../types/bookmark";



const ManageDetailModal = ({ closeModal, handleCheckedItems }: manageModalInterface) => {
  const [listItem, setListItem] = useState<bookmarkDataInterface[]>([]);
  const [fetchUrl, setFetchUrl] = useState('');
  const [addModalYn, setAddModalYn] = useState(false);
  const [isEditing, setIsEditing] = useState(false);  // 수정 모드 여부
  const [editBookmarkId, setEditBookmarkId] = useState<string | null>(null);  // 수정 중인 북마크 ID
  const [dropDownState, setDropDownState] = useState<{ [key: string]: boolean }>({});
  const [checkedItems, setCheckedItems] = useState<bookmarkDataInterface[]>([]);
  const dropDownRef = useRef<HTMLDivElement>(null); // 드롭다운 감지할 ref

  // 모달이 열릴 때 로컬 스토리지에서 북마크 리스트를 불러옴
  useEffect(() => {
    const savedBookmarks = getBookmarks();
    setListItem(savedBookmarks);
  }, []);

  // checkedItems가 업데이트될 때마다 부모로 전달
  useEffect(() => {
    handleCheckedItems(checkedItems);
  }, [checkedItems, handleCheckedItems]);

  // 드롭다운 외부 클릭 감지
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropDownRef.current && !dropDownRef.current.contains(event.target as Node)) {
        setDropDownState({});
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // 체크된 북마크 처리
  const chkBookmarkedOne = (checked: boolean, item: bookmarkDataInterface) => {
    if (checked) {
      setCheckedItems((prev) => [...prev, item]);
    } else {
      setCheckedItems((prev) => prev.filter((i) => i.bookmarkId !== item.bookmarkId));
    }
    handleCheckedItems(checkedItems);
  };

  // 드롭다운 토글
  const toggleDropdown = (id: string) => {
    setDropDownState((prev) => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  // 수정 모드 활성화
  const onEdit = (bookmark: bookmarkDataInterface) => {
    setIsEditing(true);
    setEditBookmarkId(bookmark.bookmarkId);
    setFetchUrl(bookmark.bookmarkURL);  // URL을 input에 넣기
    reset({ bookmarkTitle: bookmark.bookmarkTitle, bookmarkURL: bookmark.bookmarkURL });  // 타이틀과 URL을 input에 설정
    setAddModalYn(true);  // 자식 모달 열기
  };

  // 수정 내용 저장
  const onSaveEdit = (data: bookmarkDataInterface) => {
    const updatedBookmarks = listItem.map((bookmark) => {
      if (bookmark.bookmarkId === editBookmarkId) {
        return { ...bookmark, bookmarkTitle: data.bookmarkTitle, bookmarkURL: data.bookmarkURL };
      }
      return bookmark;
    });

    saveBookmarks(updatedBookmarks); // 로컬 스토리지에 저장
    setListItem(updatedBookmarks); // 상태 업데이트
    setIsEditing(false);
    setAddModalYn(false);  // 자식 모달 닫기
  };

  // 북마크 삭제
  const onDelete = (bookmarkId: string) => {
    const updatedBookmarks = listItem.filter((bookmark) => bookmark.bookmarkId !== bookmarkId);
    saveBookmarks(updatedBookmarks); // 로컬 스토리지에 저장
    setListItem(updatedBookmarks); // 상태 업데이트
  };

  // 북마크 추가
  const { register, handleSubmit, formState: { errors }, reset } = useForm<bookmarkDataInterface>({
    defaultValues: {
      bookmarkTitle: '',
      bookmarkURL: '',
    }
  });

  const bookmarkUrlRegex = /^(https?):\/\/(-\.)?([^\s\/?\.#-]+\.?)+(\/[^\s]*)?$/i;

  const onValid = async (data: bookmarkDataInterface) => {
    try {
      const newBookmark = await bookmarkDataFetch(data.bookmarkURL);
      if (newBookmark) {
        const existingBookmarks = getBookmarks();
        const updatedBookmarks = [...existingBookmarks, newBookmark];

        saveBookmarks(updatedBookmarks); // 로컬 스토리지에 저장
        setListItem(updatedBookmarks); // 상태 업데이트
      }
    } catch (error) {
      console.error('Error adding bookmark:', error);
    }
    setAddModalYn((prev) => !prev);
    reset();
  };

  const addBookmarksModal = () => {
    setAddModalYn((prev) => !prev);
  };

  // 오버레이 클릭 시 모달 닫기
  const handleOverlayClick = (
    e: React.MouseEvent<HTMLDivElement, MouseEvent>
) => {
    if (e.target === e.currentTarget) {
    closeModal();
    }
};

  return (
    <div className="modal-overlay fixed justify-center items-center flex inset-0"
      onClick={handleOverlayClick}>
      <div style={{
        position: 'relative',
        top: '30%',
      }} className="w-[311px] h-[566px] bg-white border border-black transform -translate-x-1/2 -translate-y-1/2">
        <div className="w-full h-[51px] flex justify-between p-2">
          <span className="w-[120px] h-[22px] text-center font-medium text-lg">즐겨찾기 관리</span>
          <span onClick={closeModal} className="w-[25px] h-[17px]">
            <IoClose size={28} />
          </span>
        </div>
        <hr />
        {listItem.map((item) => (
          <div key={item.bookmarkId} className="group flex flex-row justify-between p-1 m-1">
            <label className="text-gray-500 rounded-sm" key={item.bookmarkId}>
              <input type="checkbox" className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                id={item.bookmarkId} onChange={(e) => { chkBookmarkedOne(e.target.checked, item) }} />
              {item.bookmarkTitle}
            </label>
            {/* 점 세개 버튼 */}
            <div className="relative flex items-center justify-center">
              <button className="opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => toggleDropdown(item.bookmarkId)}>
                <span className="text-lg font-semibold">&#8230;</span>
              </button>
            </div>
            {/* 드롭다운 메뉴 */}
            {dropDownState[item.bookmarkId] && (
              <div className="absolute right-0 mt-2 w-24 bg-white border rounded-md shadow-lg" ref={dropDownRef}>
                <button onClick={() => onEdit(item)} className="block w-full text-left px-4 py-2 hover:bg-gray-100">수정</button>
                <button onClick={() => onDelete(item.bookmarkId)} className="block w-full text-left px-4 py-2 hover:bg-gray-100">삭제</button>
              </div>
            )}
          </div>
        ))}
        <div className="flex justify-center">
          <button onClick={addBookmarksModal} className="absolute bottom-3 w-[271px] h-[53px] bg-slate-50 text-main-color border-[1px] ">
            페이지 추가
          </button>
          {addModalYn && (
            <form onSubmit={isEditing ? handleSubmit(onSaveEdit) : handleSubmit(onValid)}
              style={{
                position: 'absolute',
                top: '30%',
                left: '110%',
                bottom: '30%',
                transform: 'translateX(0%)',
              }} className="flex flex-col w-[311px] h-[220px] rounded-md border-[1px] bg-white border-black gap-2 justify-center">
              <div className="flex flex-col gap-2 items-center">
                <input type="text"
                  className="w-[267px] h-[41px] rounded-md border-[1px] p-2"
                  {...register('bookmarkTitle', {
                    required: "타이틀을 작성해주세요."
                  })} />

                <input type="text"
                  id="bookmarkURL"
                  placeholder="https://www.example.com"
                  value={fetchUrl}
                  className={`w-[267px] h-[41px] rounded-md border-[1px] ${errors.bookmarkURL?.message ? "border-red-500" : "border-slate-600"} p-2`}
                  {...register('bookmarkURL', {
                    required: "URL을 입력해주세요",
                    pattern: {
                      value: bookmarkUrlRegex,
                      message: "올바른 URL을 입력해주세요."
                    }, onChange: (e) => {
                      setFetchUrl(e.target.value)
                    }
                  })} />
                {errors.bookmarkURL?.message ? <span className="text-red-500">{errors.bookmarkURL?.message}</span> : null}
              </div>
              <div className="flex row-col gap-4 justify-center m-2">
                <button onClick={closeModal} className="w-[58px] h-[34px] rounded-md border-[1px]">취소</button>
                <button className="w-[58px] h-[34px] rounded-md bg-slate-400">저장</button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ManageDetailModal;
