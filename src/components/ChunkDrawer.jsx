/**
 * 分块抽屉组件
 *
 * 用于展示文档的分块列表，支持分页和语义搜索
 */

import { useEffect, useState } from 'react';
import {
  Drawer,
  List,
  Input,
  Button,
  Empty,
  Spin,
  Pagination,
  Tag,
  Typography,
  Space,
  Card,
} from 'antd';
import {
  SearchOutlined,
  CloseOutlined,
  FileTextOutlined,
} from '@ant-design/icons';
import useKbStore from '../store/useKbStore';

const { Text, Paragraph } = Typography;
const { Search } = Input;

const ChunkDrawer = ({ open, kbId, docId, docName, onClose }) => {
  const {
    chunks,
    chunkPagination,
    chunkLoading,
    isSearchMode,
    fetchChunks,
    clearChunks,
  } = useKbStore();

  const [searchText, setSearchText] = useState('');
  const [localLoading, setLocalLoading] = useState(false);

  // 打开时加载数据
  useEffect(() => {
    if (open && kbId && docId) {
      setSearchText('');
      fetchChunks(kbId, docId, 1, 15);
    }
  }, [open, kbId, docId]);

  // 关闭时清空
  const handleClose = () => {
    clearChunks();
    setSearchText('');
    onClose();
  };

  // 搜索
  const handleSearch = async (value) => {
    if (!value.trim()) {
      // 空搜索时，恢复普通模式
      fetchChunks(kbId, docId, 1, 15);
      return;
    }
    setSearchText(value);
    setLocalLoading(true);
    await fetchChunks(kbId, docId, 1, 15, value);
    setLocalLoading(false);
  };

  // 清除搜索
  const handleClearSearch = () => {
    setSearchText('');
    fetchChunks(kbId, docId, 1, 15);
  };

  // 分页变化
  const handlePageChange = (page, pageSize) => {
    fetchChunks(kbId, docId, page, pageSize, searchText);
  };

  return (
    <Drawer
      title={
        <Space>
          <FileTextOutlined />
          <span>分块列表 - {docName}</span>
        </Space>
      }
      placement="right"
      width={600}
      open={open}
      onClose={handleClose}
    >
      {/* 搜索区域 */}
      <div style={{ marginBottom: 16 }}>
        <Search
          placeholder="输入关键词进行语义搜索..."
          allowClear
          enterButton={<SearchOutlined />}
          onSearch={handleSearch}
          loading={localLoading}
        />
        {isSearchMode && (
          <div style={{ marginTop: 8 }}>
            <Tag color="blue">搜索模式</Tag>
            <Button
              type="link"
              size="small"
              onClick={handleClearSearch}
              icon={<CloseOutlined />}
            >
              清除搜索
            </Button>
          </div>
        )}
      </div>

      {/* 分块列表 */}
      <Spin spinning={chunkLoading || localLoading}>
        {chunks.length === 0 ? (
          <Empty description={isSearchMode ? "未找到匹配的分块" : "暂无分块数据"} />
        ) : (
          <>
            <List
              dataSource={chunks}
              renderItem={(item) => (
                <Card
                  size="small"
                  style={{ marginBottom: 12 }}
                  title={
                    <Space>
                      <Tag color="geekblue">#{item.seq}</Tag>
                      {isSearchMode && item.score && (
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          相似度: {(item.score * 100).toFixed(1)}%
                        </Text>
                      )}
                    </Space>
                  }
                >
                  <Paragraph
                    ellipsis={{
                      rows: 4,
                      expandable: true,
                      symbol: '展开',
                    }}
                    style={{ margin: 0, whiteSpace: 'pre-wrap' }}
                  >
                    {item.content}
                  </Paragraph>
                </Card>
              )}
            />

            {/* 分页（搜索模式不分页） */}
            {!isSearchMode && chunkPagination.total > 0 && (
              <div style={{ marginTop: 16, textAlign: 'center' }}>
                <Pagination
                  current={chunkPagination.page}
                  pageSize={chunkPagination.pageSize}
                  total={chunkPagination.total}
                  onChange={handlePageChange}
                  showSizeChanger={false}
                  showTotal={(total) => `共 ${total} 个分块`}
                />
              </div>
            )}
          </>
        )}
      </Spin>
    </Drawer>
  );
};

export default ChunkDrawer;
