interface InvoiceNotesProps {
  notes: string;
}

export default function InvoiceNotes({ notes }: InvoiceNotesProps) {
  const content = notes.trim();

  if (content) {
    return <div className="body">{content}</div>;
  }

  return (
    <div className="body invoice-note-placeholder" aria-label="Tidak ada catatan tambahan">
      <span aria-hidden="true"></span>
      <span aria-hidden="true"></span>
    </div>
  );
}
