import { FaGithub } from "react-icons/fa";


interface GitHubLinkProps {
  name: string,
  url: string;
}


export function GitHubLink({
  name,
  url,
}: GitHubLinkProps) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="GitHubでソースコードを表示"
      className="flex badge px-4 py-4 badge-outline items-center gap-2 text-gray-700 hover:text-white hover:bg-black"
    >
      <FaGithub />
      <span className="text-sm">{name}</span>
    </a>
  );
}
