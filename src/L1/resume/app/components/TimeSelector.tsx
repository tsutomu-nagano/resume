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


  const handleFormSubmit: SubmitHandler<Schema> = (data: Schema) => {
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
                <label className={`input input-bordered flex items-center gap-2 ${errors.fromYear ? 'border-red-500 bg-red-500/25' : ''}`}>
                  <input
                    type="text"
                    className="w-20"
                    placeholder="開始年"
                    {...register("fromYear")}
                  />
                  <FaCircleExclamation className={errors.fromYear ? "text-red-500" : "opacity-0"} />
                </label>
                <span className="align-baseline">〜</span>
                <label className={`input input-bordered flex items-center gap-2 ${errors.toYear ? 'border-red-500 bg-red-500/25' : ''}`}>
                  <input
                    type="text"
                    className="w-20 bg-transparent"
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


