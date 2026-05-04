import {} from "react";
import { useParams } from "react-router-dom";

export function BoardPage() {
  const { boardId } = useParams();

  return <div>Board: {boardId}</div>;
}
