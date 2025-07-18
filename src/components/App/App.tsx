import { useState, useEffect } from "react";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { useDebounce } from "use-debounce";
import css from "./App.module.css";
import NoteList from "../NoteList/NoteList";
import Modal from "../Modal/Modal";
import NoteForm from "../NoteForm/NoteForm";
import Pagination from "../Pagination/Pagination";
import SearchBox from "../SearchBox/SearchBox";
import { fetchNotes } from "../../services/noteService";
import type { FetchNotesResponse } from "../../services/noteService";
import { Toaster, toast } from "react-hot-toast";


const PER_PAGE = 12;

const App: React.FC = () => {
  const [page, setPage] = useState(1);
  const [pageCount, setPageCount] = useState(0);
  const [search, setSearch] = useState("");
  const [debouncedSearch] = useDebounce(search, 500);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const {
    data,
    isLoading,
    isError,
    error,
  } = useQuery<FetchNotesResponse | null, Error>({
  queryKey: ["notes", page, PER_PAGE, debouncedSearch],
queryFn: () => fetchNotes({ page, perPage: PER_PAGE, search: debouncedSearch }),
    placeholderData: keepPreviousData,
  });

  useEffect(() => {
    if (data?.totalPages !== undefined) {
      setPageCount(data.totalPages);
    }
  }, [data]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch]);

  useEffect(() => {
    if (isError && error) {
      if (error.message.includes('Access token is missing or empty')) {
        toast.error(error.message);
      } else if (error.message.includes("Failed to execute 'setRequestHeader'")) {
        toast.error("Invalid token. Please check your settings or update the token.");
      }
    }
  }, [isError, error]);

  return (
    <div className={css.app}>
      <Toaster position="top-center" />
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
      {isError && error &&
        !error.message.includes('Access token is missing or empty') &&
        !error.message.includes("Failed to execute 'setRequestHeader'") && (
          <p className={css.error}>{error.message}</p>
        )}
      {!isLoading && !isError && data && data.notes && data.notes.length === 0 && <p>No notes found</p>} 
      {!isLoading && !isError && data && data.notes && data.notes.length > 0 && (
        <NoteList
          notes={data.notes}
        />
      )}

      {isModalOpen && (
        <Modal onClose={() => setIsModalOpen(false)}>
          <NoteForm
            onCancel={() => setIsModalOpen(false)}
          />
        </Modal>
      )}
    </div>
  );
};

export default App;