<claude-mem-context>
# Memory Context

# [tutorlog-web] recent context, 2026-07-12 11:09am GMT+7

No previous sessions found.
</claude-mem-context>

## Development Test Policy

- Selama masih berada di fase development atau bekerja pada feature branch, jangan menjalankan test, full test suite, responsive sweep, accessibility test, atau visual regression test kecuali diminta secara eksplisit oleh user.
- Full test suite hanya dijalankan ketika akan sync ke `main`, merge ke `main`, atau membuat PR yang menargetkan `main`.
- Untuk commit selama development, cukup review diff dan jalankan `git diff --check` secara default.
- Jika test tidak dijalankan, laporkan dengan jelas dan jangan menyatakan bahwa test sudah lulus.
