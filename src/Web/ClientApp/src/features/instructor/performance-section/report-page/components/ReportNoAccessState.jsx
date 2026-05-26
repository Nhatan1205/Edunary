import NoData from "../../../../../components/NoData";
import emptyAnalyticsImg from "../../../../../assets/images/empty-analytics.png";

export default function ReportNoAccessState() {
  return (
    <NoData
      image={emptyAnalyticsImg}
      title="No report access"
      description="You do not have any course with RevenueReport permission yet. Ask the course owner to grant access, then refresh this page."
    />
  );
}
