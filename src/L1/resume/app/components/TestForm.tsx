
import { useForm, useWatch, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

const schema = z
  .object({
    age: z.number().min(1, { message: '年齢を入力してください' }),
    parentalAgreement: z.boolean().optional(),
  })
  .refine(({ age, parentalAgreement }) => !(age < 18 && !parentalAgreement), {
    message: '保護者の同意がないと登録できません',
    path: ['parentalAgreement'],
  });

type Schema = z.infer<typeof schema>;

export  function TestForm() {
  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Schema>({
    resolver: zodResolver(schema),
  });
  const age = useWatch({ control, name: 'age' });
  const onSubmit: SubmitHandler<Schema> = (data) => console.log(data);

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div>
        <p>年齢</p>
        <input
          type="number"
          {...register('age', { valueAsNumber: true })}
        />
      </div>
      {errors.age && <p color="red">{errors.age.message}</p>}
      {age < 18 && (
        <label>
          <input type="checkbox" {...register('parentalAgreement')} />
          保護者の同意を得ていますか？
        </label>
      )}
      {!!age && errors.parentalAgreement && (
        <p style={{ color: 'red' }}>
          {errors.parentalAgreement.message}
        </p>
      )}
      <button type="submit">
        登録
      </button>
    </form>
  );
}
