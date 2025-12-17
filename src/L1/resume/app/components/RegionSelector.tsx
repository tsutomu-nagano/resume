// src/app/StatCard.tsx
"use client";

import { ReactNode, Children } from "react";
import { FaChevronDown } from "react-icons/fa6";
import { renderIconByKind } from "../common/convertor";
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import * as z from 'zod';

const schema = z.object({
  word: z.string(),
});

type Schema = z.infer<typeof schema>;


interface RegionSelectorProps {
  onScopeChange: (scope:{name:string, checked:boolean}) => void;
  onSearch: (word: string) => void;
  children?: ReactNode;
}

export function RegionSelector({ onScopeChange, onSearch, children  }: RegionSelectorProps) {

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Schema>({
    defaultValues: {
      word: undefined,
    },
    resolver: zodResolver(schema),
    mode: "onBlur",
  });



  const kind = "region";
  const labelja = "地域"



  const handleCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onScopeChange({name: event.target.name, checked: event.target.checked});
  };


  const handleFormSubmit: SubmitHandler<Schema> = (data: Schema) => {
    // data.fromYear, data.toYear は既に数値化されている想定
    console.log(data.word)
    onSearch(data.word);
  };



  return (
    <div className="dropdown">
      <div tabIndex={0} role="button" className="flex flex-row flex-nowrap gap-2 whitespace-nowrap btn btn-outline m-1">
        {renderIconByKind(kind)}{labelja}から探す<FaChevronDown />
      </div>
      <div
        tabIndex={0}
        className="dropdown-content card card-compact bg-base-100 z-[1] w-[400px] p-2 shadow">
        <div className="card-body">

          <form onSubmit={handleSubmit(handleFormSubmit)}>

            <div className="divider divider-start divider-primary">地域の範囲</div>
            <fieldset className="fieldset bg-base-100 border-base-300 p-4 text-left">
              <label className="label">
                <input type="checkbox" name="scopePrefectures" className="checkbox" onChange={handleCheckboxChange}/>
                都道府県ごとのデータ
              </label>
              <label className="label">
                <input type="checkbox" name="scopeCity" className="checkbox" onChange={handleCheckboxChange}/>
                市区町村ごとのデータ
              </label>
              <label className="label">
                <input type="checkbox" name="scopeCountry" className="checkbox" onChange={handleCheckboxChange}/>
                国ごとのデータ
              </label>
            </fieldset>

            <div className="divider divider-start divider-primary">地域名で探す</div>

            <label className="input input-bordered flex items-center gap-2">
              <input
                type="text"
                className="grow"
                placeholder="Search"
                {...register("word")}
              />
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 16 16"
                fill="currentColor"
                className="h-4 w-4 opacity-70">
                <path
                  fillRule="evenodd"
                  d="M9.965 11.026a5 5 0 1 1 1.06-1.06l2.755 2.754a.75.75 0 1 1-1.06 1.06l-2.755-2.754ZM10.5 7a3.5 3.5 0 1 1-7 0 3.5 3.5 0 0 1 7 0Z"
                  clipRule="evenodd" />
              </svg>
            </label>
            <>
            {children}
            </>
          </form>
        </div>
      </div>
    </div>
  );
}


