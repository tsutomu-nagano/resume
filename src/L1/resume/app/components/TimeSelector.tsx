// src/app/StatCard.tsx
"use client";

import { FaChevronDown, FaCircleExclamation  } from "react-icons/fa6";
import { renderIconByKind } from "../common/convertor";
import React from "react";

import { yearSchema } from "@schemas/yearSchema";
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import * as z from 'zod';


const schema = z.object({
  fromYear: yearSchema.optional(),
  toYear: yearSchema.optional()
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
    resolver: zodResolver(schema),
    mode: "onBlur",
  });


  const kind = "time";
  const labelja = "調査年"


  const handleFormSubmit: SubmitHandler<Schema> = (data: Schema) => {

    const fromYear = data.fromYear ?? "";
    const toYear = data.toYear ?? "";
    
    if (fromYear !== "" || toYear !== "") {
      onSubmit(fromYear, toYear);
    }    

  };

  return (
    <div className="dropdown w-full sm:w-auto">
      <div tabIndex={0} role="button" className="btn btn-outline m-0 flex w-full flex-row flex-nowrap gap-2 whitespace-nowrap sm:m-1 sm:w-auto">
        {renderIconByKind(kind)}{labelja}から探す<FaChevronDown />
      </div>
      <div
        tabIndex={0}
        className="dropdown-content card card-compact z-[1] w-[calc(100vw-1.5rem)] max-w-[400px] border border-base-300 bg-base-100 p-2 shadow sm:w-[min(400px,calc(100vw-2rem))]">
        <div className="card-body">

          <form onSubmit={handleSubmit(handleFormSubmit)}>
            <fieldset className="fieldset">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <label className={`input input-bordered flex items-center gap-2 ${errors.fromYear ? 'border-red-500 bg-red-500/25' : ''}`}>
                  <input
                    type="text"
                    className="w-full min-w-0 sm:w-20"
                    placeholder="開始年"
                    {...register("fromYear")}
                  />
                  <FaCircleExclamation className={errors.fromYear ? "text-red-500" : "opacity-0"} />
                </label>
                <span className="hidden align-baseline sm:inline">〜</span>
                <label className={`input input-bordered flex items-center gap-2 ${errors.toYear ? 'border-red-500 bg-red-500/25' : ''}`}>
                  <input
                    type="text"
                    className="w-full min-w-0 bg-transparent sm:w-20"
                    placeholder="終了年"
                    {...register("toYear")}
                  />
                  <FaCircleExclamation className={errors.toYear ? "text-red-500" : "opacity-0"} />
                </label>
              </div>
              {errors.fromYear && <p className="text-red-500">{`開始年は${errors.fromYear.message}`}</p>}
              {errors.toYear && <p className="text-red-500">{`終了年は${errors.toYear.message}`}</p>}
              <p className="label">例. 2022</p>
            </fieldset>
            <button type="submit" className="btn btn-primary mt-2">検索</button>
          </form>

        </div>
      </div>
    </div>
  );
}

