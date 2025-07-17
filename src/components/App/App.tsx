import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useDebounce } from "use-debounce";
import css from "./App.module.css";
import NoteList from "../NoteList/NoteList";
import Modal from "../Modal/Modal";
import NoteForm from "../NoteForm/NoteForm";
import Pagination from "../Pagination/Pagination";
import SearchBox from "../SearchBox/SearchBox";
import { fetchNotes, createNote, deleteNote } from "../services/noteService";
import type { Note } from "../types/note";
import type { FetchNotesResponse, CreateNoteData } from "../services/noteService";

const App: React.FC = () => {
  const [page, setPage] = useState(1);
  const [pageCount, setPageCount] = useState(0);
  const [search, setSearch] = useState("");
  const [debouncedSearch] = useDebounce(search, 500);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const queryClient = useQueryClient();

  const {
    data,
    isLoading,
    isError,
    error,
    isFetching,
  } = useQuery<FetchNotesResponse, Error>({
    queryKey: ["notes", page, 12, debouncedSearch],
    queryFn: () => fetchNotes({ page, perPage: 12, search: debouncedSearch }),
  });

  useEffect(() => {
    if (data?.totalPages !== undefined) {
      setPageCount(data.totalPages);
    }
  }, [data]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch]);

  const createNoteMutation = useMutation<Note, Error, CreateNoteData>({
    mutationFn: createNote,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notes"] });
      setIsModalOpen(false);
    },
  });

  const deleteNoteMutation = useMutation<Note, Error, number>({
    mutationFn: deleteNote,
    onMutate: (id: number) => {
      setDeletingId(id);
    },
    onSettled: () => {
      setDeletingId(null);
      queryClient.invalidateQueries({ queryKey: ["notes"] });
    },
  });

  const notes: Note[] = data?.notes || [];

  console.log("data", data);
  console.log("notes", notes);
  console.log("isError", isError, "error", error);

  return (
    <div className={css.app}>
      <header className={css.toolbar}>
        <SearchBox value={search} onChange={setSearch} />

        {pageCount > 1 && (
          <Pagination page={page} setPage={setPage} pageCount={pageCount} />
        )}

        <button
          type="button"
          className={css.button}
          onClick={() => setIsModalOpen(true)}
        >
          Create note +
        </button>
      </header>

      {isLoading && <p>Loading notes...</p>}
      {isError && <p className={css.error}>Error: {error?.message}</p>}
      {!isLoading && !isError && notes.length === 0 && <p>No notes found</p>}
      {!isLoading && !isError && notes.length > 0 && (
        <NoteList
          notes={notes}
          onDelete={(id) => deleteNoteMutation.mutate(id)}
          deletingId={deletingId}
          isLoading={isFetching}
        />
      )}

      {isModalOpen && (
        <Modal onClose={() => setIsModalOpen(false)}>
          <NoteForm
            onSubmit={(newNote) => createNoteMutation.mutate(newNote)}
            isLoading={createNoteMutation.status === "pending"}
            onCancel={() => setIsModalOpen(false)}
          />
        </Modal>
      )}
    </div>
  );
};

export default App;
