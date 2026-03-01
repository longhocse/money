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

  return (
    <Container className="mt-4">
      <h2 className="mb-4 text-center">💰 Quản lý thu chi</h2>

      {/* FORM */}
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

      {/* TỔNG QUAN */}
      <Row className="mb-4">
        <Col md={4}>
          <Card bg="success" text="white" className="shadow-sm">
            <Card.Body>
              <Card.Title>Tổng thu</Card.Title>
              <Card.Text>
                {(summary.TotalThu || 0).toLocaleString("vi-VN")} đ
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>

        <Col md={4}>
          <Card bg="danger" text="white" className="shadow-sm">
            <Card.Body>
              <Card.Title>Tổng chi</Card.Title>
              <Card.Text>
                {(summary.TotalChi || 0).toLocaleString("vi-VN")} đ
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>

        <Col md={4}>
          <Card bg="primary" text="white" className="shadow-sm">
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

      {/* SỐ DƯ THEO NGUỒN */}
      <Card className="mb-4 shadow-sm">
        <Card.Body>
          <Card.Title>💳 Số dư theo nguồn</Card.Title>
          {balanceBySource.map((item) => (
            <p key={item.Source} className="mb-1">
              <strong>{item.Source}:</strong>{" "}
              {item.Balance?.toLocaleString("vi-VN")} đ
            </p>
          ))}
        </Card.Body>
      </Card>

      {/* DANH SÁCH */}
      <Card className="shadow-sm">
        <Card.Body>
          <Card.Title>📋 Danh sách giao dịch</Card.Title>
          <Table striped bordered hover responsive>
            <thead>
              <tr>
                <th>Loại</th>
                <th>Số tiền</th>
                <th>Mục đích</th>
                <th>Nguồn</th>
                <th>Ngày</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {[...data]
  .sort((a, b) => new Date(b.TransactionDate) - new Date(a.TransactionDate))
  .map((item) => (
                <tr key={item.Id}>
                  <td>
  {item.Type === "Thu" ? (
    <span className="badge bg-success">Thu</span>
  ) : (
    <span className="badge bg-danger">Chi</span>
  )}
</td>
                  <td>{item.Amount.toLocaleString("vi-VN")} đ</td>
                  <td>{item.Purpose}</td>
                  <td>{item.Source}</td>
                  <td>{item.TransactionDate?.substring(0, 10)}</td>
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
        </Card.Body>
      </Card>
    </Container>
  );
}

export default App;