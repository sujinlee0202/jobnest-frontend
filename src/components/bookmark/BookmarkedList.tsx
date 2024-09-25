import { DndContext, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext } from '@dnd-kit/sortable';
import { useEffect, useState } from 'react';
import BookmarkedEachItem from './BookmarkedEachItem';
import ManageDetailModal from './ManageDetailModal';
import { bookmarkDataInterface } from '../../types/bookmark';
import { getBookmarks } from '../../hooks/useBookmarks';


const BookmarkedList = () => {
    const [gridItem, setGridItem] = useState<bookmarkDataInterface[]>([]); // 그리드 요소
    const [modalYn, setmodalYn] = useState(false);

    // 모달이 닫힐 때마다 로컬 스토리지에서 checked가 true인 북마크들만 가져와서 그리드에 표시
    useEffect(() => {
        const saved = getBookmarks();
        const chkFiltered = saved.filter((item) => item.checked); // checked가 true인 항목만 필터링
        setGridItem(chkFiltered); 
    }, [modalYn]); // 모달 상태가 바뀔 때마다 실행

    // 체크된 항목으로 상태 업데이트
    // const updateGridItems = (checkedItems: bookmarkDataInterface[]) => {
    //     const filteredItems = checkedItems.filter(item => item.checked); // checked가 true인 항목들만 필터링
    //     setGridItem(filteredItems); // 그리드 아이템 업데이트
    //     console.log('Updated Grid Items:', filteredItems);
    // };

    // 드래그앤드랍
    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (over && active.id !== over.id) {
            setGridItem((prevItem) => {
                const oldIdx = prevItem.findIndex((item) => item.bookmarkId === active.id);
                const newIdx = prevItem.findIndex((item) => item.bookmarkId === over.id);
                return arrayMove(prevItem, oldIdx, newIdx);
            });
        }
    };

    // 즐겨찾기 관리 모달창
    const openManageModal = () => {
        setmodalYn((prev) => !prev);
    };

    return (
        <>
            <DndContext onDragEnd={handleDragEnd}>
                <SortableContext items={gridItem.map((item) => item.bookmarkId)}>
                    <div className="grid-container grid grid-cols-7 gap-x-[30px] gap-y-[89px] pt-[46px]">
                        {gridItem.map((item) => (
                            <div key={item.bookmarkId}>
                                <BookmarkedEachItem
                                    bookmarkId={item.bookmarkId}
                                    bookmarkURL={item.bookmarkId}
                                    bookmarkTitle={item.bookmarkTitle}
                                    bookmarkOgImg={item.bookmarkOgImg}
                                    checked={item.checked}
                                />
                            </div>
                        ))}
                          <div className="outline-dotted outline-slate-500 flex justify-center items-center w-[180px] h-[180px] mb-[12px] bg-slate-100 rounded-lg">
                            <button
                                className="w-[93px] h-[35px] bg-blue-500 m-5 font-suit font-semibold text-center text-[15px] leading-[15px] flex items-center text-white rounded-md justify-center"
                                onClick={openManageModal}>
                                관리하기
                            </button>
                        </div>
                    </div>
                </SortableContext>
            </DndContext>
          
            {modalYn ? <ManageDetailModal closeModal={() => setmodalYn(false)}/> : null}
        </>
    );
};

export default BookmarkedList;
