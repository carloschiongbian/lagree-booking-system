import React, { useRef, useState, useEffect } from "react";
import { SearchOutlined } from "@ant-design/icons";
import type { InputRef, TableColumnsType, TableColumnType } from "antd";
import { Button, Input, Row, Space, Table, Modal, Typography } from "antd";
import type { FilterDropdownProps } from "antd/es/table/interface";
import Highlighter from "react-highlight-words";
import { CreatePackageProps } from "@/lib/props";
import { MdDelete, MdEdit } from "react-icons/md";
import { formatPrice } from "@/lib/utils";

type DataIndex = keyof CreatePackageProps;

const { Text } = Typography;

interface AdminPackageTableProps {
  data: CreatePackageProps[];
  onEdit: (record: CreatePackageProps) => void;
}

const AdminPackageTable = ({ data, onEdit }: AdminPackageTableProps) => {
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

  const showDeleteConfirm = (record: CreatePackageProps) => {
    confirm({
      title: "Delete Package",
      icon: null,
      content: `Are you sure you want to delete this package?`,
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
  ): TableColumnType<CreatePackageProps> => ({
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

  const columns: TableColumnsType<CreatePackageProps> = [
    {
      title: "Title",
      dataIndex: "name",
      key: "name",
      width: isMobile ? undefined : "20%",
      ...getColumnSearchProps("name"),
    },
    {
      title: "Price (PHP)",
      dataIndex: "price",
      key: "price",
      width: isMobile ? undefined : "20%",
      ...getColumnSearchProps("price"),
      render: (_, record) => (
        <Row>
          <Text>{formatPrice(record.price)}</Text>
        </Row>
      ),
    },
    {
      title: "Validity Period (days)",
      dataIndex: "validity_period",
      key: "validity_period",
      width: isMobile ? undefined : "20%",
      ...getColumnSearchProps("validity_period"),
    },
    {
      title: "Package Type",
      dataIndex: "promo",
      key: "promo",
      width: isMobile ? undefined : "20%",
      ...getColumnSearchProps("promo"),
      render: (_, record) => (
        <Row>
          <Text>{record.promo ? "Promo" : "Regular"}</Text>
        </Row>
      ),
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
    <Table<CreatePackageProps>
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

export default AdminPackageTable;
