// src/app/StatCard.tsx
"use client";

import { FaChevronDown } from "react-icons/fa6";
import { renderIconByKind } from "../common/convertor";
import React from "react";

import { yearSchema } from "@schemas/yearSchema";
import { useForm, SubmitHandler } from 'react-hook-form';
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
  onSubmit: (fromYear: String, toYear: String) => void;
}

export function TimeSelector({ onSubmit }: TimeSelectorProps) {

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Schema>({
    defaultValues: {
      fromYear: undefined,
      toYear: undefined
    },
    resolver: zodResolver(schema),
    mode: "onBlur",
  });


  const kind = "time";
  const labelja = "調査年"


  const handleFormSubmit: SubmitHandler<Schema> = (data) => {
    // data.fromYear, data.toYear は既に数値化されている想定
    onSubmit(data.fromYear, data.toYear);
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

          <form onSubmit={handleSubmit(handleFormSubmit)}>
            <fieldset className="fieldset">
              <div className="flex flex-row items-center gap-3">
                <div>
                  <legend className="fieldset-legend">開始年</legend>
                  <input
                    type="text"
                    className={`input input-bordered ${errors.fromYear ? 'border-red-500' : ''} w-40`}
                    placeholder="開始年"
                    {...register("fromYear")}
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


