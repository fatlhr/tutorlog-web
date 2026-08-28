import { PageMain, RouteCanvas } from "@/components/app-ui/route-canvas";
import { LoadingState } from "@/components/app-ui/states";
import { LoadingPageHeader } from "../route-loading";

export default function ProfilLoading() {
  return (
    <RouteCanvas route="settings">
      <PageMain>
        <LoadingPageHeader label="Memuat judul Profil" actions={0} />
        <LoadingState shape="form" rowCount={2} label="Memuat nama dan email" />
        <LoadingState shape="form" rowCount={2} label="Memuat status akses" />
        <LoadingState shape="form" rowCount={2} label="Memuat pembayaran terbaru" />
      </PageMain>
    </RouteCanvas>
  );
}
