// src/app/StatCard.tsx
"use client";

import { FaChevronDown, FaCircleExclamation } from "react-icons/fa6";
import { renderIconByKind } from "../common/convertor";
import React from "react";
import { on } from "events";

import { yearSchema } from "@schemas/yearSchema";
import { useForm, useWatch, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';


const schema = z.object({
  fromYear: yearSchema,
  toYear: yearSchema
// }).refine(({ fromYear, toYear }) => Number(fromYear) <= Number(toYear), {
//   message: "終了年は開始年以降を指定してください",
//   path: ["toYear"],
});

type Schema = z.infer<typeof schema>;


interface TimeSelectorProps {
  onEnter: () => void;
  onChangeFrom: (value: number) => void; // ← 開始年を親に渡す
  onChangeTo: (value: number) => void;   // ← 終了年を親に渡す
  onSubmit: () => void;
}

export function TimeSelector({ onEnter, onChangeFrom, onChangeTo, onSubmit }: TimeSelectorProps) {

  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Schema>({
    resolver: zodResolver(schema),
    mode: "all",
  });


console.log(schema.safeParse({ fromYear: "2024", toYear : "2014" }).success); // true
console.log(schema.safeParse({ fromYear: "2024年", toYear : "2014年" }).success); // true
console.log(schema.safeParse({ fromYear: "Ｒ1年", toYear : "2014" }).success); // true
console.log(schema.safeParse({ fromYear: "H12", toYear : "2014" }).success);  // true
console.log(schema.safeParse({ fromYear: "元" , toYear : "2014"}).success);   // false


  const kind = "time";
  const labelja = "調査年"

  console.log(errors.fromYear);

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      console.log("Enter key pressed");
      onEnter();
    }
  };


  return (
    <div className="dropdown">
      <div tabIndex={0} role="button" className="flex flex-row gap-2 btn btn-outline m-1">
        {renderIconByKind(kind)}{labelja}から探す<FaChevronDown />
      </div>
      <div
        tabIndex={0}
        className="dropdown-content card card-compact bg-base-100 z-[1] w-[400px] p-2 shadow">
        <div className="card-body">

          <form onSubmit={handleSubmit(onSubmit)}>
            <fieldset className="fieldset">
              <div className="flex flex-row items-center gap-3">
                  <div>
                    <legend className="fieldset-legend">開始年</legend>
                    <input
                      type="text"
                      className={`input input-bordered ${errors.fromYear ? 'border-red-500' : ''} w-40`}
                      placeholder="開始年"
                      {...register("fromYear")}
                      onKeyDown={handleKeyDown}
                    />
                  </div>
                  <span>〜</span>
                  <div>
                    <legend className="fieldset-legend">終了年</legend>
                    <input
                      type="text"
                      className="input input-bordered w-40"
                      placeholder="終了年"
                      {...register("toYear")}
                      onKeyDown={handleKeyDown}
                    />
                  </div>
              </div>
              {errors.fromYear && <p className="text-red-500">{errors.fromYear.message}</p>}
              {errors.toYear && <p className="text-red-500">{errors.toYear.message}</p>}
              <p className="label">例. 2022</p>
            </fieldset>
            <button type="submit" className="btn btn-primary mt-2">検索</button>
          </form>

        </div>
      </div>
    </div>
  );
}


