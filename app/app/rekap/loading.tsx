import { PageMain, RouteCanvas } from "@/components/app-ui/route-canvas";
import { LoadingState } from "@/components/app-ui/states";
import { LoadingPageHeader, LoadingSectionHeading } from "../route-loading";
import styles from "../route-loading.module.css";

export default function RekapLoading() {
  return (
    <RouteCanvas route="recap">
      <PageMain>
        <LoadingPageHeader label="Memuat judul Rekap" actions={2} />
        <div className={styles.recapDesktopFilters}>
          <LoadingState shape="form" rowCount={2} label="Memuat filter periode dan murid" />
        </div>
        <div className={styles.recapMobileFilter}>
          <LoadingState shape="form" rowCount={1} label="Memuat tombol filter" />
        </div>
        <LoadingState shape="summary" rowCount={3} label="Memuat ringkasan sesi" />
        <section className={styles.sectionStack} aria-label="Memuat daftar sesi">
          <LoadingSectionHeading label="Memuat judul daftar sesi" />
          <LoadingState shape="rows" rowCount={5} label="Memuat daftar sesi" />
        </section>
      </PageMain>
    </RouteCanvas>
  );
}
