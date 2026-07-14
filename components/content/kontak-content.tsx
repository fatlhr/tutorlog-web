import { EnvelopeSimple } from "@phosphor-icons/react/dist/ssr";

export function KontakContent() {
  return (
    <article className="tl-article-main">
      <section className="tl-article-section">
        <EnvelopeSimple size={30} weight="duotone" aria-hidden="true" />
        <h2>Tulis lewat email</h2>
        <p>
          Gunakan satu alamat untuk semua pertanyaan tentang TutorLog. Sertakan konteks singkat bila kamu melaporkan masalah.
        </p>
        <a className="tl-contact-email" href="mailto:tutorlog.admin@gmail.com">tutorlog.admin@gmail.com</a>
      </section>
    </article>
  );
}
