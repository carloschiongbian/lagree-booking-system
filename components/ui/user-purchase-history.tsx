import { attendanceStatus } from "@/lib/utils";
import { Button, Col, List, Row, Typography } from "antd";
import dayjs from "dayjs";
import PackageHistoryCard from "./package-history-card";

const { Text } = Typography;

const UserPurchaseHistory = ({ purchaseHistory }: { purchaseHistory: any }) => {
  return (
    <List
      grid={{
        gutter: 16,
        xs: 1,
        sm: 1,
        md: 1,
        lg: 1,
        xl: 1,
        xxl: 1,
      }}
      itemLayout="vertical"
      dataSource={purchaseHistory}
      renderItem={(item) => (
        <List.Item className="mx-[50px]">
          <PackageHistoryCard item={item} />
        </List.Item>
      )}
      locale={{
        emptyText: (
          <div className="text-center py-12 text-slate-500">
            <Row className="justify-center">
              <Col className="flex flex-col justify-center items-center gap-y-[10px]">
                <Text>Client has not purchased any packages yet</Text>
              </Col>
            </Row>
          </div>
        ),
      }}
    />
  );
};

export default UserPurchaseHistory;
