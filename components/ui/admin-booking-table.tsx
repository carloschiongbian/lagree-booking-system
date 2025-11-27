import { useRef, useState, useEffect, useMemo } from "react";
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
  Tooltip,
  Tag,
} from "antd";
import type { FilterDropdownProps } from "antd/es/table/interface";
import Highlighter from "react-highlight-words";
import { formatTime } from "@/lib/utils";
import { CreateClassProps } from "@/lib/props";
import { MdDelete, MdEdit } from "react-icons/md";
import { IoEye } from "react-icons/io5";
import dayjs, { Dayjs } from "dayjs";
import { useClassManagement } from "@/lib/api";

type DataIndex = keyof CreateClassProps;

interface AdminBookingTableProps {
  data: CreateClassProps[];
  loading?: boolean;
  onEdit: (record: CreateClassProps) => void;
  onDelete: (id: string) => void;
  onView: (record: CreateClassProps) => void;
}

const { Text } = Typography;

const AdminBookingTable = ({
  data,
  loading,
  onEdit,
  onView,
  onDelete,
}: AdminBookingTableProps) => {
  const [searchText, setSearchText] = useState("");
  const [searchedColumn, setSearchedColumn] = useState("");
  const [isMobile, setIsMobile] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedRecordToDelete, setSelectedRecordToDelete] = useState<
    any | null
  >(null);

  const searchInput = useRef<InputRef>(null);

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

  const showDeleteConfirm = (record: any) => {
    setSelectedRecordToDelete(record);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (selectedRecordToDelete) {
      onDelete(selectedRecordToDelete.id as string);
    }
    setIsDeleteModalOpen(false);
    setSelectedRecordToDelete(null);
  };

  const handleCancelDelete = () => {
    setIsDeleteModalOpen(false);
    setSelectedRecordToDelete(null);
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
      record?.[dataIndex]
        ?.toString()
        ?.toLowerCase()
        ?.includes((value as string).toLowerCase()) ?? false,
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
        render: (_, record) => {
          return (
            <Row className="gap-x-[5px]">
              <Text>{record.instructor_name}</Text>
              {record.instructor_id === null && (
                <Tag key={record.id} color={"red"}>
                  Need to replace
                </Tag>
              )}
            </Row>
          );
        },
      },
      {
        title: "Start Time",
        dataIndex: "start_time",
        key: "start_time",
        width: isMobile ? undefined : "20%",
        render: (_, record) => (
          <Text>{formatTime(record.start_time as Dayjs)}</Text>
        ),
      },
      {
        title: "End Time",
        dataIndex: "end_time",
        key: "end_time",
        width: isMobile ? undefined : "20%",
        render: (_, record) => (
          <Text>{formatTime(record.end_time as Dayjs)}</Text>
        ),
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
        render: (_, record) => {
          const canDelete = (record?.start_time as Dayjs).isSameOrAfter(
            dayjs()
          );
          return (
            <Row className="justify-center cursor-pointer gap-3">
              <IoEye
                size={20}
                // color="#1890ff"
                onClick={() => onView(record)}
              />
              <MdEdit
                size={20}
                color="#733AC6"
                onClick={() => onEdit(record)}
              />
              <Tooltip title={!canDelete && "Cannot delete past classes"}>
                <MdDelete
                  size={20}
                  color="red"
                  onClick={() => {
                    if (canDelete) showDeleteConfirm(record);
                  }}
                />
              </Tooltip>
            </Row>
          );
        },
      },
    ],
    [isMobile, searchedColumn, searchText, data]
  );

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
        locale={{ emptyText: "Classes have not been created for this date" }}
        size={isMobile ? "small" : "middle"}
        className="admin-booking-table"
      />

      <Modal
        title="Delete Class"
        open={isDeleteModalOpen}
        onOk={handleConfirmDelete}
        onCancel={handleCancelDelete}
        okText="Delete"
        okType="danger"
        cancelText="Cancel"
        width={isMobile ? "90%" : 430}
      >
        <Row className="py-[20px]">
          <Text>Are you sure you want to delete this class?</Text>
        </Row>
      </Modal>
    </>
  );
};

export default AdminBookingTable;
