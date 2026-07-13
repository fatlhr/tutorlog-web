import { PageMain } from "@/components/app-ui/route-canvas";
import { LoadingState } from "@/components/app-ui/states";

export default function AppLoading() {
  return (
    <PageMain>
      <LoadingState shape="form" rowCount={1} label="Memuat judul halaman" />
      <LoadingState shape="summary" rowCount={3} label="Memuat ringkasan halaman" />
      <LoadingState shape="rows" rowCount={3} label="Memuat isi halaman" />
    </PageMain>
  );
}
