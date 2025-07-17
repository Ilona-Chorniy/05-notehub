import axios from 'axios';
import type { Note, NoteTag } from '../types/note';

export interface FetchNotesParams {
    page?: number;
    perPage?: number;
    search?: string;
}

export interface FetchNotesResponse {
    notes: Note[];
    totalPages: number;
}

export interface CreateNoteData {
    title: string;
    content: string;
    tag: NoteTag;
}

const BASE_URL = 'https://notehub-public.goit.study/api';
const TOKEN = import.meta.env.VITE_NOTEHUB_TOKEN;

if (!TOKEN) {
    console.warn('VITE_NOTEHUB_TOKEN is not set! API requests may fail.');
}

export async function fetchNotes(params: FetchNotesParams = {}): Promise<FetchNotesResponse> {
    try {
        const page = params.page ?? 1;
        const perPage = params.perPage ?? 12;
        const queryParams: Record<string, unknown> = {
            page,
            perPage,
        };
        if (params.search) {
            queryParams.search = params.search;
        }

        const response = await axios.get<FetchNotesResponse>(`${BASE_URL}/notes`, {
            headers: {
                Authorization: `Bearer ${TOKEN}`,
            },
            params: queryParams,
        });
        console.log('API response', response.data);
        return response.data;
    } catch (error) {
        console.error('Error fetching notes:', error);
        throw error;
    }
}

export async function createNote(data: CreateNoteData): Promise<Note> {
    try {
        const response = await axios.post<Note>(`${BASE_URL}/notes`, data, {
            headers: {
                Authorization: `Bearer ${TOKEN}`,
            },
        });
        return response.data;
    } catch (error) {
        console.error('Error creating note:', error);
        throw error;
    }
}

export async function deleteNote(id: number): Promise<Note> {
    try {
        const response = await axios.delete<Note>(`${BASE_URL}/notes/${id}`, {
            headers: {
                Authorization: `Bearer ${TOKEN}`,
            },
        });
        return response.data;
    } catch (error) {
        console.error('Error deleting note:', error);
        throw error;
    }
}



