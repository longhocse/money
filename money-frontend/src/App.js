import { useState, useEffect } from "react";
import axios from "axios";
import {
  Container,
  Row,
  Col,
  Form,
  Button,
  Table,
  Card
} from "react-bootstrap";
// ❌ Đã xóa: import ChatBox from "./ChatBox";

function App() {

  const [form, setForm] = useState({
    type: "Thu",
    amount: "",
    purpose: "",
    source: "Tiền mặt",
    date: ""
  });

  const [data, setData] = useState([]);
  const [summary, setSummary] = useState({});
  const [balanceBySource, setBalanceBySource] = useState([]);
  const [editingId, setEditingId] = useState(null);

  // SEARCH
  const [search, setSearch] = useState("");
  const [keyword, setKeyword] = useState("");

  const loadData = async () => {
    const res = await axios.get("http://localhost:5000/transactions");
    setData(res.data);

    const sum = await axios.get("http://localhost:5000/summary");
    setSummary(sum.data);

    const balance = await axios.get("http://localhost:5000/balance-by-source");
    setBalanceBySource(balance.data);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (editingId) {
      await axios.put(
        `http://localhost:5000/transactions/${editingId}`,
        form
      );
      setEditingId(null);
    } else {
      await axios.post("http://localhost:5000/transactions", form);
    }

    setForm({
      type: "Thu",
      amount: "",
      purpose: "",
      source: "Tiền mặt",
      date: ""
    });

    loadData();
  };

  const handleDelete = async (id) => {
    if (window.confirm("Bạn có chắc muốn xóa?")) {
      await axios.delete(`http://localhost:5000/transactions/${id}`);
      loadData();
    }
  };

  const handleEdit = (item) => {
    setForm({
      type: item.Type,
      amount: item.Amount,
      purpose: item.Purpose,
      source: item.Source,
      date: item.TransactionDate.substring(0, 10)
    });
    setEditingId(item.Id);
  };

  const filteredData = data.filter(item =>
    item.Purpose?.toLowerCase().includes(keyword.toLowerCase())
  );

  const groupedData = Object.entries(
    [...filteredData]
      .sort((a, b) => new Date(b.TransactionDate) - new Date(a.TransactionDate))
      .reduce((acc, item) => {
        const date = item.TransactionDate?.substring(0, 10);
        if (!acc[date]) acc[date] = [];
        acc[date].push(item);
        return acc;
      }, {})
  );

  return (
    <>
      <Container className="mt-4">
        <h2 className="mb-4 text-center">💰 Quản lý thu chi</h2>

        <Card className="mb-4 shadow-sm">
          <Card.Body>
            <Form onSubmit={handleSubmit}>
              <Row className="g-2">
                <Col md={2}>
                  <Form.Select
                    value={form.type}
                    onChange={(e) =>
                      setForm({ ...form, type: e.target.value })
                    }
                  >
                    <option>Thu</option>
                    <option>Chi</option>
                  </Form.Select>
                </Col>

                <Col md={2}>
                  <Form.Control
                    type="number"
                    placeholder="Số tiền"
                    value={form.amount}
                    onChange={(e) =>
                      setForm({ ...form, amount: e.target.value })
                    }
                  />
                </Col>

                <Col md={3}>
                  <Form.Control
                    type="text"
                    placeholder="Mục đích"
                    value={form.purpose}
                    onChange={(e) =>
                      setForm({ ...form, purpose: e.target.value })
                    }
                  />
                </Col>

                <Col md={2}>
                  <Form.Select
                    value={form.source}
                    onChange={(e) =>
                      setForm({ ...form, source: e.target.value })
                    }
                  >
                    <option>Tiền mặt</option>
                    <option>Tài khoản</option>
                  </Form.Select>
                </Col>

                <Col md={2}>
                  <Form.Control
                    type="date"
                    value={form.date}
                    onChange={(e) =>
                      setForm({ ...form, date: e.target.value })
                    }
                  />
                </Col>

                <Col md={1}>
                  <Button variant="primary" type="submit" className="w-100">
                    {editingId ? "✓" : "+"}
                  </Button>
                </Col>
              </Row>
            </Form>
          </Card.Body>
        </Card>

        <Row className="mb-4">
          <Col md={4}>
            <Card bg="success" text="white">
              <Card.Body>
                <Card.Title>Tổng thu</Card.Title>
                <Card.Text>
                  {(summary.TotalThu || 0).toLocaleString("vi-VN")} đ
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>

          <Col md={4}>
            <Card bg="danger" text="white">
              <Card.Body>
                <Card.Title>Tổng chi</Card.Title>
                <Card.Text>
                  {(summary.TotalChi || 0).toLocaleString("vi-VN")} đ
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>

          <Col md={4}>
            <Card bg="primary" text="white">
              <Card.Body>
                <Card.Title>Số dư</Card.Title>
                <Card.Text>
                  {(
                    (summary.TotalThu || 0) -
                    (summary.TotalChi || 0)
                  ).toLocaleString("vi-VN")} đ
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        <Card className="mb-4 shadow-sm">
          <Card.Body>
            <Card.Title>💳 Số dư theo nguồn</Card.Title>
            {balanceBySource.map((item) => (
              <p key={item.Source}>
                <strong>{item.Source}:</strong>{" "}
                {item.Balance?.toLocaleString("vi-VN")} đ
              </p>
            ))}
          </Card.Body>
        </Card>

        <Card className="shadow-sm">
          <Card.Body>

            <Card.Title>📋 Danh sách giao dịch</Card.Title>

            <Form.Control
              type="text"
              placeholder="🔍 Tìm theo mục đích (Enter)..."
              className="mb-3"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  setKeyword(search);
                }
              }}
            />

            {groupedData.map(([date, items]) => {

              const totalThu = items
                .filter(i => i.Type === "Thu")
                .reduce((sum, i) => sum + i.Amount, 0);

              const totalChi = items
                .filter(i => i.Type === "Chi")
                .reduce((sum, i) => sum + i.Amount, 0);

              return (
                <div key={date} className="mb-4">

                  <div
                    className="d-flex justify-content-between p-2 mb-2"
                    style={{
                      background: "#f1f3f5",
                      borderRadius: "10px",
                      fontWeight: "600"
                    }}
                  >
                    <div>📅 {date}</div>

                    <div>
                      <span className="text-success me-3">
                        +{totalThu.toLocaleString("vi-VN")} đ
                      </span>

                      <span className="text-danger">
                        -{totalChi.toLocaleString("vi-VN")} đ
                      </span>
                    </div>

                  </div>

                  <Table striped bordered hover responsive>

                    <thead>
                      <tr>
                        <th>Loại</th>
                        <th>Số tiền</th>
                        <th>Mục đích</th>
                        <th>Nguồn</th>
                        <th>Hành động</th>
                      </tr>
                    </thead>

                    <tbody>

                      {items.map((item) => (

                        <tr key={item.Id}>

                          <td>
                            {item.Type === "Thu"
                              ? <span className="badge bg-success">Thu</span>
                              : <span className="badge bg-danger">Chi</span>}
                          </td>

                          <td>{item.Amount.toLocaleString("vi-VN")} đ</td>

                          <td>{item.Purpose}</td>

                          <td>{item.Source}</td>

                          <td>

                            <Button
                              size="sm"
                              variant="warning"
                              onClick={() => handleEdit(item)}
                            >
                              Sửa
                            </Button>{" "}

                            <Button
                              size="sm"
                              variant="danger"
                              onClick={() => handleDelete(item.Id)}
                            >
                              Xóa
                            </Button>

                          </td>

                        </tr>

                      ))}

                    </tbody>

                  </Table>

                </div>
              );
            })}

          </Card.Body>
        </Card>

      </Container>

      {/* ❌ Đã xóa ChatBox */}

    </>
  );
}

export default App;