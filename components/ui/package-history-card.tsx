import { checkIfExpired, formatDate } from "@/lib/utils";
import { Card, Divider, Row, Tooltip, Typography } from "antd";
import dayjs from "dayjs";

const { Text } = Typography;

const PackageHistoryCard = ({ item }: { item: any }) => {
  const expired = item.status === "expired";
  return (
    <Tooltip title={expired ? "Expired" : "Active"}>
      <Card
        className="w-full shadow-sm transition-shadow border-none relative"
        style={{
          minWidth: 200,
          cursor: expired ? "not-allowed" : "pointer",
        }}
        title={item.packages.title}
        styles={{
          header: {
            ...(expired
              ? {}
              : {
                  transition: "box-shadow 0.3s ease",
                  borderInline: "3px solid #22c55e",
                  borderTop: "3px solid #22c55e",
                }),
            color: expired ? "#888" : "white",
            fontSize: 20,
            paddingInline: 15,
            backgroundColor: expired ? "rgba(0,0,0,0.3)" : "#36013F",
          },
          body: {
            ...(expired
              ? { border: "1px solid gray" }
              : {
                  transition: "box-shadow 0.3s ease",
                  borderInline: "3px solid #22c55e",
                  borderBottom: "3px solid #22c55e",
                }),
            backgroundColor: expired ? "rgba(0,0,0,0.1)" : "white",
            color: expired ? "#888" : "inherit",
            opacity: expired ? 0.6 : 1,
            paddingInline: 15,
          },
        }}
      >
        <Row className="flex flex-col">
          <Text style={{ fontSize: 16 }}>
            <span style={{ fontWeight: 600 }}>
              {item?.packageCredits ?? "Unlimited"}
            </span>{" "}
            Sessions
          </Text>
          <Text style={{ fontSize: 16 }}>
            Valid for{" "}
            <span style={{ fontWeight: 600 }}>{item.validityPeriod} days</span>
          </Text>
          <Divider className="m-0 my-[5px] p-0" />
          <Text style={{ fontSize: 16 }}>Purchased on </Text>
          <Text style={{ fontSize: 16, fontWeight: 600 }}>
            {formatDate(dayjs(item.purchaseDate))}
          </Text>
          <Divider className="m-0 my-[5px] p-0" />
          <Row className="flex flex-col min-h-[24]">
            <Text style={{ fontSize: 16 }}>
              {checkIfExpired(
                dayjs(item?.expirationDate ?? item?.expiration_date),
              )
                ? "Expired"
                : "Expires"}{" "}
              on{" "}
            </Text>
            <Text
              style={{
                fontSize: 16,
                fontWeight: 600,
                color: "#f87171",
              }}
            >
              {formatDate(dayjs(item?.expirationDate ?? item?.expiration_date))}
            </Text>
          </Row>
        </Row>
      </Card>
    </Tooltip>
  );
};

export default PackageHistoryCard;
