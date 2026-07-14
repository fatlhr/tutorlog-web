import { PageMain, RouteCanvas } from "@/components/app-ui/route-canvas";
import { LoadingState } from "@/components/app-ui/states";

export default function RekapLoading() {
  return (
    <RouteCanvas route="recap">
      <PageMain>
        <LoadingState shape="form" rowCount={1} label="Memuat judul Rekap" />
        <LoadingState shape="form" rowCount={2} label="Memuat filter periode" />
        <LoadingState shape="summary" rowCount={3} label="Memuat ringkasan sesi" />
        <LoadingState shape="rows" rowCount={5} label="Memuat daftar sesi" />
      </PageMain>
    </RouteCanvas>
  );
}
