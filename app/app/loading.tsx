import { PageMain, RouteCanvas } from "@/components/app-ui/route-canvas";
import { LoadingState } from "@/components/app-ui/states";
import { LoadingPageHeader, LoadingSectionHeading } from "./route-loading";
import homeStyles from "./home.module.css";
import styles from "./route-loading.module.css";

export default function AppLoading() {
  return (
    <RouteCanvas route="home">
      <PageMain>
        <div className={homeStyles.hero}>
          <LoadingPageHeader label="Memuat judul Beranda" actions={0} />
          <LoadingState shape="summary" rowCount={3} label="Memuat ringkasan bulan ini" />
        </div>

        <section className={styles.homeLoadingSection} aria-label="Memuat sesi terbaru">
          <LoadingSectionHeading label="Memuat judul sesi terbaru" action />
          <div className={homeStyles.workspace}>
            <LoadingState shape="rows" rowCount={3} label="Memuat sesi terbaru" />
            <aside className={homeStyles.workspaceAside} aria-label="Memuat langkah berikutnya">
              <LoadingState shape="form" rowCount={2} label="Memuat langkah berikutnya" />
            </aside>
          </div>
        </section>

        <section className={homeStyles.closingRail} aria-label="Memuat arsip dan pembaruan TutorLog">
          <div className={homeStyles.archiveRail}>
            <LoadingState shape="form" rowCount={2} label="Memuat arsip bulan lalu" />
          </div>
          <div className={homeStyles.roadmapRail}>
            <LoadingState shape="form" rowCount={2} label="Memuat pembaruan TutorLog" />
          </div>
        </section>
      </PageMain>
    </RouteCanvas>
  );
}
