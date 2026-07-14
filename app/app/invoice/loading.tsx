import { PageMain, RouteCanvas } from "@/components/app-ui/route-canvas";
import {
  LoadingLayout,
  LoadingState,
} from "@/components/app-ui/states";

export default function InvoiceLoading() {
  return (
    <RouteCanvas route="invoice">
      <PageMain>
        <LoadingState shape="form" rowCount={1} label="Memuat judul Invoice" />
        <LoadingLayout variant="invoice">
          <LoadingState shape="form" rowCount={6} label="Memuat formulir Invoice" />
          <LoadingState shape="preview" label="Memuat preview Invoice" />
        </LoadingLayout>
      </PageMain>
    </RouteCanvas>
  );
}
