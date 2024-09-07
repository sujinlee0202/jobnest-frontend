import { useRegisterStore } from "../../store/registerStore";
import { SearchRegisterInputs } from "../../types/register";
import Button from "./Button";
import Input from "./Input";
import SelectBox from "./SelectBox";
import { SubmitHandler, useForm } from "react-hook-form";

const SearchForm = () => {
  const { handleSubmit, register } = useForm<SearchRegisterInputs>({
    mode: "onChange",
  });
  const searchRegister = useRegisterStore((state) => state.searchRegister);

  // 등기 또는 대장 검색
  const onSubmitSearchAddress: SubmitHandler<SearchRegisterInputs> = (data) => {
    searchRegister(data);
  };

  return (
    <form
      className='w-full h-11 flex items-center gap-4 mb-[100px]'
      onSubmit={handleSubmit(onSubmitSearchAddress)}
    >
      <SelectBox register={register("register_type")}></SelectBox>
      <Input
        type='text'
        placeholder='주소를 입력해주세요.'
        register={register("address")}
      />
      <Button className='w-24 rounded-md'>검색</Button>
    </form>
  );
};
export default SearchForm;
