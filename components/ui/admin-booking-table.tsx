import React, { useRef, useState, useEffect, useMemo } from "react";
import { SearchOutlined } from "@ant-design/icons";
import type { InputRef, TableColumnsType, TableColumnType } from "antd";
import {
  Button,
  Input,
  Row,
  Space,
  Table,
  Modal,
  Typography,
  Drawer,
  Col,
  Divider,
  List,
  Select,
} from "antd";
import type { FilterDropdownProps } from "antd/es/table/interface";
import Highlighter from "react-highlight-words";
import { formatTime } from "@/lib/utils";
import { CreateClassProps } from "@/lib/props";
import { MdDelete, MdEdit } from "react-icons/md";
import { IoEye } from "react-icons/io5";
import dayjs from "dayjs";

type DataIndex = keyof CreateClassProps;

interface AdminBookingTableProps {
  data: CreateClassProps[];
  loading?: boolean;
  onEdit: (record: CreateClassProps) => void;
}

const { Text } = Typography;

const AdminBookingTable = ({
  data,
  loading,
  onEdit,
}: AdminBookingTableProps) => {
  const [searchText, setSearchText] = useState("");
  const [searchedColumn, setSearchedColumn] = useState("");
  const [isMobile, setIsMobile] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<CreateClassProps | null>(
    null
  );
  const searchInput = useRef<InputRef>(null);
  const { confirm } = Modal;

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    // rAF throttle
    let rafId: number | null = null;
    const onResize = () => {
      if (rafId !== null) return;
      rafId = window.requestAnimationFrame(() => {
        rafId = null;
        handleResize();
      });
    };

    handleResize();
    window.addEventListener("resize", onResize);
    return () => {
      if (rafId !== null) cancelAnimationFrame(rafId);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  const handleSearch = (
    selectedKeys: string[],
    confirm: FilterDropdownProps["confirm"],
    dataIndex: DataIndex
  ) => {
    confirm();
    setSearchText(selectedKeys[0]);
    setSearchedColumn(dataIndex);
  };

  const handleReset = (clearFilters: () => void) => {
    clearFilters();
    setSearchText("");
  };

  const handleView = (record: CreateClassProps) => {
    setSelectedRecord(record);
    setViewModalOpen(true);
  };

  const handleCloseView = () => {
    setViewModalOpen(false);
    setSelectedRecord(null);
  };

  const showDeleteConfirm = (record: CreateClassProps) => {
    confirm({
      title: "Delete Class",
      icon: null,
      content: `Are you sure you want to delete the class with instructor ${record.instructor_name}?`,
      okText: "Delete",
      okType: "danger",
      cancelText: "Cancel",
      centered: true,
      width: isMobile ? "90%" : 416,
      onOk() {
        console.log("Deleted:", record);
      },
      onCancel() {
        console.log("Cancelled delete");
      },
    });
  };

  const getColumnSearchProps = (
    dataIndex: DataIndex
  ): TableColumnType<CreateClassProps> => ({
    filterDropdown: ({
      setSelectedKeys,
      selectedKeys,
      confirm,
      clearFilters,
      close,
    }) => (
      <div style={{ padding: 8 }} onKeyDown={(e) => e.stopPropagation()}>
        <Input
          ref={searchInput}
          placeholder={`Search ${dataIndex}`}
          value={selectedKeys[0]}
          onChange={(e) =>
            setSelectedKeys(e.target.value ? [e.target.value] : [])
          }
          onPressEnter={() =>
            handleSearch(selectedKeys as string[], confirm, dataIndex)
          }
          style={{ marginBottom: 8, display: "block" }}
        />
        <Space>
          <Button
            type="primary"
            onClick={() =>
              handleSearch(selectedKeys as string[], confirm, dataIndex)
            }
            icon={<SearchOutlined />}
            size="small"
            style={{ width: 90 }}
          >
            Search
          </Button>
          <Button
            onClick={() => clearFilters && handleReset(clearFilters)}
            size="small"
            style={{ width: 90 }}
          >
            Reset
          </Button>
          <Button
            type="link"
            size="small"
            onClick={() => {
              confirm({ closeDropdown: false });
              setSearchText((selectedKeys as string[])[0]);
              setSearchedColumn(dataIndex);
            }}
          >
            Filter
          </Button>
          <Button
            type="link"
            size="small"
            onClick={() => {
              close();
            }}
          >
            close
          </Button>
        </Space>
      </div>
    ),
    filterIcon: (filtered: boolean) => (
      <SearchOutlined style={{ color: filtered ? "#1677ff" : undefined }} />
    ),
    onFilter: (value, record) =>
      record[dataIndex]
        .toString()
        .toLowerCase()
        .includes((value as string).toLowerCase()),
    filterDropdownProps: {
      onOpenChange(open) {
        if (open) {
          setTimeout(() => searchInput.current?.select(), 100);
        }
      },
    },
    render: (text) =>
      searchedColumn === dataIndex ? (
        <Highlighter
          highlightStyle={{ backgroundColor: "#ffc069", padding: 0 }}
          searchWords={[searchText]}
          autoEscape
          textToHighlight={text ? text.toString() : ""}
        />
      ) : (
        text
      ),
  });

  const columns = useMemo<TableColumnsType<CreateClassProps>>(
    () => [
      {
        title: "Instructor",
        dataIndex: "instructor_name",
        key: "instructor_name",
        width: isMobile ? undefined : "20%",
        ...getColumnSearchProps("instructor_name"),
      },
      {
        title: "Start Time",
        dataIndex: "start_time",
        key: "start_time",
        width: isMobile ? undefined : "20%",
        render: (_, record) => <Text>{formatTime(record.start_time)}</Text>,
      },
      {
        title: "End Time",
        dataIndex: "end_time",
        key: "end_time",
        width: isMobile ? undefined : "20%",
        render: (_, record) => <Text>{formatTime(record.end_time)}</Text>,
      },
      {
        title: "Slots",
        dataIndex: "slots",
        key: "slots",
        width: isMobile ? undefined : "20%",
      },
      {
        title: "Action",
        key: "action",
        width: isMobile ? undefined : "10%",
        fixed: isMobile ? undefined : "right",
        render: (_, record) => (
          <Row className="justify-center cursor-pointer gap-3">
            <IoEye
              size={20}
              // color="#1890ff"
              onClick={() => handleView(record)}
            />
            <MdEdit size={20} color="#733AC6" onClick={() => onEdit(record)} />
            <MdDelete
              size={20}
              color="red"
              onClick={() => showDeleteConfirm(record)}
            />
          </Row>
        ),
      },
    ],
    [isMobile, searchedColumn, searchText, data]
  );

  useEffect(() => {
    console.log("Selected Record:", selectedRecord);
  }, [selectedRecord]);

  const tempData = [
    { user: "John Doe" },
    { user: "Tom Cruise" },
    { user: "Taylor Swift" },
    { user: "Lionel Messi" },
    { user: "Rachel Brosnahan" },
    { user: "Lil Yachty" },
    { user: "Anthony Keidis" },
  ];

  const handleChange = (value: string) => {
    console.log(`selected ${value}`);
  };

  return (
    <>
      <Table<CreateClassProps>
        loading={loading}
        columns={columns}
        dataSource={data}
        scroll={{ x: isMobile ? 600 : undefined }}
        pagination={{
          defaultPageSize: 10,
          showSizeChanger: true,
          pageSizeOptions: ["10", "20", "50"],
          responsive: true,
          showTotal: (total, range) =>
            `${range[0]}-${range[1]} of ${total} items`,
        }}
        size={isMobile ? "small" : "middle"}
        className="admin-booking-table"
      />

      {isMobile ? (
        <Drawer
          title="View Class Details"
          placement="right"
          onClose={handleCloseView}
          open={viewModalOpen}
          width="100%"
          styles={{
            body: { paddingTop: 24 },
          }}
        >
          <div className="space-y-4">{/* Content placeholder */}</div>
        </Drawer>
      ) : (
        <Modal
          title="View Class Details"
          open={viewModalOpen}
          onCancel={handleCloseView}
          footer={null}
          width={600}
          maskClosable={false}
        >
          <Col className="flex flex-col pt-0 space-y-4">
            <Row wrap={false} className="justify-between">
              <Text className="!mt-[10px]">
                <span className="font-semibold">Instructor:</span>{" "}
                {selectedRecord?.instructor_name}
              </Text>
              <Text className="!mt-[10px]">
                <span className="font-semibold">Time:</span>{" "}
                {`${formatTime(
                  dayjs(selectedRecord?.start_time)
                )} - ${formatTime(dayjs(selectedRecord?.end_time))}`}
              </Text>
            </Row>

            <Divider />

            <Col>
              <div className="mb-[15px]">
                <span className="font-semibold">Attendees</span>
              </div>

              {/* Empty State for 0 attendees */}
              {tempData.length === 0 && (
                <Row wrap={false} className="justify-center">
                  <span className="font-semibold p-4">
                    Nobody has booked this class yet
                  </span>
                </Row>
              )}

              {/* Non-empty state */}
              <div
                style={{
                  overflowY: "auto",
                  maxHeight: "30vh",
                  scrollbarWidth: "none", // Firefox
                  msOverflowStyle: "none", // IE and Edge
                }}
                className="overflow-y-auto"
              >
                <List
                  itemLayout="horizontal"
                  dataSource={tempData}
                  renderItem={(item, index) => (
                    <Row
                      key={index}
                      wrap={false}
                      className="border-b py-3 justify-between"
                    >
                      <List.Item.Meta
                        title={item.user}
                        className="flex items-center"
                      />

                      <Select
                        className="!outline-none"
                        defaultValue="no-show"
                        style={{ width: 120 }}
                        onChange={handleChange}
                        options={[
                          { value: "no-show", label: "No Show" },
                          { value: "attended", label: "Attended" },
                          { value: "cancelled", label: "Cancelled" },
                        ]}
                      />
                    </Row>
                  )}
                />
              </div>
            </Col>
          </Col>
        </Modal>
      )}
    </>
  );
};

export default AdminBookingTable;
