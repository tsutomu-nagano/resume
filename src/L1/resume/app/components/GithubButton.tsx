import { FaGithub } from "react-icons/fa";

export function GitHubLink() {
  return (
    <a
      href="https://github.com/tsutomu-nagano/resume"
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-2 text-gray-700 hover:text-black"
    >
      <FaGithub />
    </a>
  );
}