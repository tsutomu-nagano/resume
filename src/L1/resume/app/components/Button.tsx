

import { renderIconByKind } from "../common/convertor";


interface ButtonProps {
  kind: string;
  name: string;
  isSelected: boolean;
  onClick?: () => void;
}

export function Button({ kind , name, isSelected, onClick }: ButtonProps) {
  
  const text = <div className="flex flex-row gap-2 items-center">{renderIconByKind(kind)}{name}</div>

  return(
    <div
      tabIndex={0}
      role="button"
      className={`btn m-1 ${isSelected ? 'btn-primary' : 'btn-outline'}`}
      onClick={onClick}
    >
    {text}
    </div>
  );

}