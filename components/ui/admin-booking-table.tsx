import React, { useRef, useState, useEffect } from "react";
import { SearchOutlined } from "@ant-design/icons";
import type { InputRef, TableColumnsType, TableColumnType } from "antd";
import { Button, Input, Row, Space, Table, Modal } from "antd";
import type { FilterDropdownProps } from "antd/es/table/interface";
import Highlighter from "react-highlight-words";
import dayjs, { Dayjs } from "dayjs";
import { formatTime } from "@/lib/utils";
import { CreateClassProps } from "@/lib/props";
import { MdDelete, MdEdit } from "react-icons/md";
import { ExclamationCircleFilled } from "@ant-design/icons";

type DataIndex = keyof CreateClassProps;

interface AdminBookingTableProps {
  data: CreateClassProps[];
  onEdit: (record: CreateClassProps) => void;
}

const AdminBookingTable = ({ data, onEdit }: AdminBookingTableProps) => {
  const [searchText, setSearchText] = useState("");
  const [searchedColumn, setSearchedColumn] = useState("");
  const [isMobile, setIsMobile] = useState(false);
  const searchInput = useRef<InputRef>(null);
  const { confirm } = Modal;

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
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

  const showDeleteConfirm = (record: CreateClassProps) => {
    confirm({
      title: "Delete Class",
      icon: null,
      content: `Are you sure you want to delete the class with instructor ${record.instructor}?`,
      okText: "Delete",
      okType: "danger",
      cancelText: "Cancel",
      centered: isMobile,
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

  const columns: TableColumnsType<CreateClassProps> = [
    {
      title: "Instructor",
      dataIndex: "instructor",
      key: "instructor",
      width: isMobile ? undefined : "20%",
      ...getColumnSearchProps("instructor"),
    },
    {
      title: "Start Time",
      dataIndex: "start_time",
      key: "start_time",
      width: isMobile ? undefined : "20%",
      ...getColumnSearchProps("start_time"),
    },
    {
      title: "End Time",
      dataIndex: "end_time",
      key: "end_time",
      width: isMobile ? undefined : "20%",
      ...getColumnSearchProps("end_time"),
    },
    {
      title: "Slots",
      dataIndex: "slots",
      key: "slots",
      width: isMobile ? undefined : "20%",
      ...getColumnSearchProps("slots"),
    },
    {
      title: "Action",
      key: "action",
      width: isMobile ? undefined : "10%",
      fixed: isMobile ? undefined : "right",
      render: (_, record) => (
        <Row className="justify-center cursor-pointer gap-3">
          <MdEdit
            size={20}
            color="#733AC6"
            onClick={() => onEdit(record)}
          />
          <MdDelete
            size={20}
            color="red"
            onClick={() => showDeleteConfirm(record)}
          />
        </Row>
      ),
    },
  ];

  return (
    <Table<CreateClassProps>
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
  );
};

export default AdminBookingTable;
