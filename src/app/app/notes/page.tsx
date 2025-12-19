// src/app/app/notes/page.tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, Plus, Save, Trash2 } from "lucide-react";

type Note = {
  id: string;
  title: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
};

export default function NotesPage() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [currentNote, setCurrentNote] = useState<Partial<Note>>({
    title: "",
    content: "",
  });
  const [isEditing, setIsEditing] = useState(false);

  const handleSaveNote = () => {
    if (!currentNote.title || !currentNote.content) return;

    const now = new Date();
    if (isEditing && currentNote.id) {
      // Update existing note
      setNotes(
        notes.map((note) =>
          note.id === currentNote.id
            ? ({ ...note, ...currentNote, updatedAt: now } as Note)
            : note
        )
      );
    } else {
      // Create new note
      const newNote: Note = {
        id: Date.now().toString(),
        title: currentNote.title,
        content: currentNote.content,
        createdAt: now,
        updatedAt: now,
      };
      setNotes([...notes, newNote]);
    }

    // Reset form
    setCurrentNote({ title: "", content: "" });
    setIsEditing(false);
  };

  const handleEditNote = (note: Note) => {
    setCurrentNote(note);
    setIsEditing(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDeleteNote = (id: string) => {
    if (confirm("Are you sure you want to delete this note?")) {
      setNotes(notes.filter((note) => note.id !== id));
      if (currentNote.id === id) {
        setCurrentNote({ title: "", content: "" });
        setIsEditing(false);
      }
    }
  };

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">My Notes</h1>
        <Button
          onClick={() => {
            setCurrentNote({ title: "", content: "" });
            setIsEditing(true);
          }}
        >
          <Plus className="mr-2 h-4 w-4" />
          New Note
        </Button>
      </div>

      {(isEditing || notes.length === 0) && (
        <Card>
          <CardHeader>
            <input
              type="text"
              placeholder="Note Title"
              className="text-xl font-semibold border-none focus:ring-0 p-0"
              value={currentNote.title || ""}
              onChange={(e) =>
                setCurrentNote({ ...currentNote, title: e.target.value })
              }
            />
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              placeholder="Start writing your notes here..."
              className="min-h-[200px]"
              value={currentNote.content || ""}
              onChange={(e) =>
                setCurrentNote({ ...currentNote, content: e.target.value })
              }
            />
            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => {
                  setCurrentNote({ title: "", content: "" });
                  setIsEditing(false);
                }}
              >
                Cancel
              </Button>
              <Button onClick={handleSaveNote}>
                <Save className="mr-2 h-4 w-4" />
                {isEditing ? "Update Note" : "Save Note"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {!isEditing && notes.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {notes.map((note) => (
            <Card key={note.id} className="h-full flex flex-col">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg">{note.title}</CardTitle>
                  <div className="flex space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEditNote(note)}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-500 hover:text-red-600"
                      onClick={() => handleDeleteNote(note.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  {new Date(note.updatedAt).toLocaleDateString()}
                </p>
              </CardHeader>
              <CardContent className="flex-1 overflow-hidden">
                <p className="text-sm text-gray-700 line-clamp-6">
                  {note.content}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {!isEditing && notes.length === 0 && (
        <div className="text-center py-12">
          <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <BookOpen className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900">No notes yet</h3>
          <p className="mt-1 text-sm text-gray-500">
            Get started by creating a new note.
          </p>
          <div className="mt-6">
            <Button
              onClick={() => {
                setCurrentNote({ title: "", content: "" });
                setIsEditing(true);
              }}
            >
              <Plus className="mr-2 h-4 w-4" />
              New Note
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
