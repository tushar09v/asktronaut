import { useState, useEffect, useRef } from "react";
import { renameChatAPI } from "../services/api";

export default function EditableTitle({ chatId, title, onTitleChange, startEditing, onEditEnd }) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(title);
  const inputRef = useRef(null);

  // Sync when title changes externally (e.g. auto-title update)
  useEffect(() => {
    setValue(title);
  }, [title]);

  // Allow parent to trigger edit mode
  useEffect(() => {
    if (startEditing && !editing) {
      setEditing(true);
    }
  }, [startEditing]);

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editing]);

  const exitEdit = () => {
    setEditing(false);
    onEditEnd?.();
  };

  const save = async () => {
    const trimmed = value.trim();
    exitEdit();

    if (!trimmed || trimmed === title) {
      setValue(title); // revert
      return;
    }

    try {
      const { data } = await renameChatAPI(chatId, trimmed);
      setValue(data.title);
      onTitleChange?.(chatId, data.title);
    } catch (err) {
      console.error("Failed to rename chat");
      setValue(title); // revert on error
    }
  };

  const handleKeyDown = (e) => {
    // Enforce proper event scoping: ONLY run when actively editing
    if (!editing) return;

    // Prevent cross-component interference
    if (e.target !== e.currentTarget) return;

    if (e.key === "Enter") {
      e.preventDefault();
      save(); // submit message
    } else if (e.key === "Escape") {
      setValue(title);
      exitEdit();
    }
  };

  if (editing) {
    return (
      <input
        ref={inputRef}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onBlur={save}
        onKeyDown={handleKeyDown}
        className="flex-1 bg-elevated text-text-primary text-sm rounded px-1.5 py-0.5
          border border-accent outline-none min-w-0
          transition-colors duration-150"
        maxLength={80}
        onClick={(e) => e.stopPropagation()}
      />
    );
  }

  return (
    <span
      className="truncate flex-1 leading-snug cursor-text"
      onDoubleClick={(e) => {
        e.stopPropagation();
        setEditing(true);
      }}
      title={title}
    >
      {title || "New Chat"}
    </span>
  );
}

