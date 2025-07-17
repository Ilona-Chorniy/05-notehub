import css from "./NoteList.module.css";
import type { Note } from "../../types/note";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteNote } from "../../services/noteService";

interface NoteListProps {
  notes: Note[];
}

const NoteList: React.FC<NoteListProps> = ({ notes }) => {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: deleteNote,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notes"] });
    },
  });

  return (
    <>
      <ul className={css.list}>
        {notes.map((note) => (
          <li
            key={note.id}
            className={`${css.listItem} ${mutation.variables === note.id && mutation.status === "pending" ? css.deleting : ""}`}
          >
            <h2 className={css.title}>{note.title}</h2>
            <p className={css.content}>{note.content}</p>
            <div className={css.footer}>
              <span className={css.tag}>{note.tag}</span>
              <button
                className={css.button}
                onClick={() => mutation.mutate(note.id)}
                disabled={mutation.variables === note.id && mutation.status === "pending"}
              >
                {mutation.variables === note.id && mutation.status === "pending" ? "Deleting..." : "Delete"}
              </button>
            </div>
          </li>
        ))}
      </ul>
      {mutation.status === "pending" && <p>Updating list…</p>}
    </>
  );
};

export default NoteList;
