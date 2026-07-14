import { PageMain, RouteCanvas } from "@/components/app-ui/route-canvas";
import {
  LoadingLayout,
  LoadingState,
} from "@/components/app-ui/states";

export default function AppLoading() {
  return (
    <RouteCanvas route="home">
      <PageMain>
        <LoadingState shape="form" rowCount={1} label="Memuat judul Beranda" />
        <LoadingState shape="summary" rowCount={3} label="Memuat ringkasan bulan ini" />
        <LoadingLayout variant="home">
          <LoadingState shape="rows" rowCount={3} label="Memuat sesi terbaru" />
          <LoadingState shape="form" rowCount={3} label="Memuat ringkasan bulan lalu" />
        </LoadingLayout>
      </PageMain>
    </RouteCanvas>
  );
}
