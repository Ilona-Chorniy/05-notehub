import css from "./NoteList.module.css";
import type { Note } from "../../types/note";

interface NoteListProps {
  notes: Note[];
  onDelete: (id: number) => void;
  deletingId: number | null;
  isLoading: boolean;
}

const NoteList: React.FC<NoteListProps> = ({
  notes,
  onDelete,
  deletingId,
  isLoading,
}) => {
  return (
    <>
      <ul className={css.list}>
        {notes.map((note) => (
          <li
            key={note.id}
            className={`${css.listItem} ${deletingId === note.id ? css.deleting : ""}`}
          >
            <h2 className={css.title}>{note.title}</h2>
            <p className={css.content}>{note.content}</p>
            <div className={css.footer}>
              <span className={css.tag}>{note.tag}</span>
              <button
                className={css.button}
                onClick={() => onDelete(note.id)}
                disabled={deletingId === note.id}
              >
                {deletingId === note.id ? "Deleting..." : "Delete"}
              </button>
            </div>
          </li>
        ))}
      </ul>
      {isLoading && <p>Updating list…</p>}
    </>
  );
};

export default NoteList;
