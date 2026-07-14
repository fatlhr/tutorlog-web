@/Users/fatih/.codex/RTK.md

# TutorLog Web Agent Rules

Aturan ini berlaku hanya untuk repo `/Users/fatih/Code/Playground/tutorlog-web`.

## Command Style

- Gunakan prefix `rtk` untuk command shell.
- Utamakan inspeksi lokal sebelum bertindak: baca file, cek diff, cek status branch, dan pahami scope perubahan.
- Jangan menghapus, revert, atau overwrite perubahan user kecuali diminta eksplisit.

## Git Boundaries

Boleh tanpa approval tambahan:

- Menjalankan command Git read-only seperti `git status`, `git diff`, `git log`, dan inspeksi branch.
- Menjalankan `git diff --check` sebagai verifikasi ringan default.
- Commit docs-only langsung di `develop`, selama perubahan tidak menyentuh behavior app, runtime config, scripts, dependencies, package files, CI, atau workflow automation.

Harus minta approval eksplisit sebelum:

- Membuat atau switch branch.
- Membuat atau memakai Git worktree.
- Commit perubahan code.
- Merge ke branch apa pun.
- Push ke remote.
- Membuat atau mengubah PR.

Jangan pakai worktree kecuali user meminta worktree secara eksplisit.

## Development Test Policy

- Selama development atau feature work, jangan menjalankan test, full test suite, responsive sweep, accessibility check, visual regression, atau PDF export test kecuali diminta eksplisit oleh user.
- Untuk commit development biasa, default verification cukup review diff dan `git diff --check`.
- Sebelum merge atau sync ke `develop`, berhenti dan tanya apakah user ingin menjalankan atau skip check berikut: test, responsive sweep, accessibility check, visual regression, dan PDF export test.
- Full test suite hanya wajib ketika akan sync ke `main`, merge ke `main`, atau membuat PR yang menargetkan `main`, kecuali user mengubah instruksi itu.
- Jika check tidak dijalankan, laporkan dengan jelas dan jangan menyatakan check tersebut lulus.

## Temporary Artifacts

- Jangan meninggalkan screenshot, PDF hasil test, dump HTML, trace, log, atau scratch file di repo kecuali user meminta untuk menyimpannya.
- Jika artifact sementara diperlukan, taruh di lokasi yang jelas sementara seperti `tmp/` atau `live-screenshots/`, lalu bersihkan sebelum handoff.
- `.superpowers/` jangan dibuat atau dipertahankan kecuali memang menjadi source workflow aktif untuk task saat itu.
- Sebelum commit atau handoff, jalankan `git status --short` dan jelaskan file yang masih berubah serta mana yang intentional.

## Scope And UX Boundaries

Boleh tanpa approval tambahan jika sudah masuk scope:

- Mengubah visual styling: spacing, radius, border, shadow, color token usage, typography scale, dan alignment.
- Memperbaiki responsive layout selama content dan workflow tetap sama.
- Membersihkan CSS atau component lokal jika output UI tetap setara.
- Memperbaiki bug visual yang jelas dari screenshot atau instruksi langsung.
- Mengganti decoration atau illustration ketika user meminta arah visual baru.
- Mengubah placeholder, hint, atau helper copy kecil yang memperjelas input tanpa mengubah workflow.

Harus minta approval eksplisit sebelum:

- Mengubah route, navigation item, page hierarchy, atau entry point.
- Mengubah urutan workflow, termasuk invoice, rekap, auth, dan protected app flow.
- Menambah field, menghapus field, mengubah required atau optional status, atau mengubah data mapping.
- Mengubah business logic, termasuk perhitungan invoice, filter rekap, agregasi sesi, dan behavior PDF export.
- Mengubah legal copy, wording formal invoice, atau wording pembayaran.
- Mengubah state management, API contract, schema, env config, dependency, package file, build config, atau CI config.
- Mengubah pola UX besar seperti page menjadi modal, modal menjadi page, table menjadi cards, dialog menjadi bottom sheet, atau perubahan struktural sejenis.
- Mengubah dummy data yang memengaruhi preview contract.
- Melakukan redesign di luar route atau surface yang diminta user.

Boleh ditawarkan sebagai opsi, tetapi jangan langsung diimplementasikan:

- Alternatif UX atau product flow.
- Arah visual protected app yang terasa seperti landing page.
- Penghapusan analytics hook, accessibility attribute, validation, atau error handling.
- Update ledger plan atau milestone sebelum pekerjaan terkait benar-benar diverifikasi.

Jika user approve opsi tersebut, opsi itu baru masuk scope.

## Planning Gate

Wajib present mini plan dan minta approval sebelum mengerjakan perubahan yang menyentuh:

- Shared component, token, layout system, atau invoice/PDF generator.
- Struktur page.
- Data mapping, business logic, validation, export, atau auth.
- Refactor yang bukan hanya styling lokal.
- Perubahan yang membutuhkan screenshot atau manual QA setelahnya.

Fix kecil boleh langsung dikerjakan setelah membaca file terkait, termasuk spacing, copy, label, padding, dan typo lokal.

## Completion Claims

Sebelum mengatakan work sudah done, fixed, passing, ready, atau selesai:

- Jalankan `git status --short`.
- Jalankan `git diff --check` kecuali user eksplisit skip.
- Review diff untuk memastikan tidak ada file yang tidak sengaja ikut berubah.
- Sebutkan check yang dijalankan dan check yang di-skip.

Untuk perubahan UI atau PDF, jangan menyiratkan hasil visual sudah diverifikasi kecuali benar-benar dicek. Jika visual QA tidak diminta atau tidak dijalankan, tulis jelas di handoff.


<claude-mem-context>
# Memory Context

# [tutorlog-web] recent context, 2026-07-14 6:13pm GMT+7

No previous sessions found.
</claude-mem-context>