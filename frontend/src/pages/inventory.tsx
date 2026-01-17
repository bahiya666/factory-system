import { useState, useEffect } from 'react';
import api from '../api/api';

interface InventoryItem {
  id: number;
  productId: number;
  quantity: number;
  lastUpdated: string;
  product: {
    id: number;
    name: string;
    description?: string;
    unitCost: number;
    lowStockThreshold?: number;
    supplierId: number;
    supplier: {
      id: number;
      name: string;
    };
  };
}

interface InventoryAnalytics {
  totalItems: number;
  totalValue: number;
  lowStockCount: number;
  outOfStockCount: number;
  topSuppliers: Array<{
    supplierName: string;
    totalItems: number;
    totalValue: number;
  }>;
  recentMovements: Array<{
    productName: string;
    quantity: number;
    timestamp: string;
    type: 'purchase' | 'dispatch';
  }>;
}

export default function Inventory() {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [analytics, setAnalytics] = useState<InventoryAnalytics | null>(null);
  const [lowStockItems, setLowStockItems] = useState<InventoryItem[]>([]);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [updateForm, setUpdateForm] = useState({
    quantity: '',
    operation: 'add' as 'add' | 'subtract' | 'set',
  });

  const [dispatchForm, setDispatchForm] = useState({
    quantity: '',
    reason: '',
  });
  const [showDispatchModal, setShowDispatchModal] = useState(false);

  useEffect(() => {
    fetchInventory();
    fetchAnalytics();
    fetchLowStockItems();
  }, []);

  const fetchInventory = async () => {
    try {
      const response = await api.get('/inventory');
      setInventory(response.data);
    } catch (err) {
      setError('Failed to fetch inventory');
    }
  };

  const fetchAnalytics = async () => {
    try {
      const response = await api.get('/inventory/analytics');
      setAnalytics(response.data);
    } catch (err) {
      console.error('Failed to fetch analytics');
    }
  };

  const fetchLowStockItems = async () => {
    try {
      const response = await api.get('/inventory/low-stock');
      setLowStockItems(response.data);
    } catch (err) {
      console.error('Failed to fetch low stock items');
    }
  };

  const handleUpdateQuantity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem) return;

    try {
      await api.patch(`/inventory/${selectedItem.productId}/quantity`, {
        quantity: parseInt(updateForm.quantity),
        operation: updateForm.operation,
      });
      setShowUpdateModal(false);
      setSelectedItem(null);
      setUpdateForm({ quantity: '', operation: 'add' });
      fetchInventory();
      fetchAnalytics();
      fetchLowStockItems();
    } catch (err) {
      setError('Failed to update inventory');
    }
  };

  const handleDispatch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem) return;

    try {
      await api.post(`/inventory/${selectedItem.productId}/dispatch`, {
        quantity: parseInt(dispatchForm.quantity),
        reason: dispatchForm.reason,
      });
      setShowDispatchModal(false);
      setSelectedItem(null);
      setDispatchForm({ quantity: '', reason: '' });
      fetchInventory();
      fetchAnalytics();
      fetchLowStockItems();
    } catch (err) {
      setError('Failed to dispatch product');
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      fetchInventory();
      return;
    }

    try {
      const response = await api.get(`/inventory/search?q=${encodeURIComponent(searchQuery)}`);
      setInventory(response.data);
    } catch (err) {
      setError('Failed to search inventory');
    }
  };

  const getStockStatus = (item: InventoryItem) => {
    if (item.quantity === 0) return { status: 'Out of Stock', color: '#dc3545' };
    if (item.product.lowStockThreshold && item.quantity < item.product.lowStockThreshold) {
      return { status: 'Low Stock', color: '#ffc107' };
    }
    return { status: 'In Stock', color: '#28a745' };
  };

  const filteredInventory = searchQuery 
    ? inventory 
    : inventory;

  if (error) return <div>Error: {error}</div>;

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1>Inventory Dashboard</h1>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <input
            type="text"
            placeholder="Search inventory..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            style={{ padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
          />
          <button
            onClick={handleSearch}
            style={{ padding: '8px 16px', backgroundColor: '#007bff', color: 'white', border: 'none', cursor: 'pointer' }}
          >
            Search
          </button>
        </div>
      </div>

      {/* Analytics Cards */}
      {analytics && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '30px' }}>
          <div style={{ backgroundColor: '#f8f9fa', padding: '20px', borderRadius: '8px', border: '1px solid #dee2e6' }}>
            <h3 style={{ margin: '0 0 10px 0', color: '#495057' }}>Total Items</h3>
            <p style={{ fontSize: '24px', fontWeight: 'bold', margin: '0', color: '#007bff' }}>
              {analytics.totalItems.toLocaleString()}
            </p>
          </div>
          <div style={{ backgroundColor: '#f8f9fa', padding: '20px', borderRadius: '8px', border: '1px solid #dee2e6' }}>
            <h3 style={{ margin: '0 0 10px 0', color: '#495057' }}>Total Value</h3>
            <p style={{ fontSize: '24px', fontWeight: 'bold', margin: '0', color: '#28a745' }}>
              ${analytics.totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </div>
          <div style={{ backgroundColor: '#fff3cd', padding: '20px', borderRadius: '8px', border: '1px solid #ffeaa7' }}>
            <h3 style={{ margin: '0 0 10px 0', color: '#856404' }}>Low Stock Items</h3>
            <p style={{ fontSize: '24px', fontWeight: 'bold', margin: '0', color: '#ffc107' }}>
              {analytics.lowStockCount}
            </p>
          </div>
          <div style={{ backgroundColor: '#f8d7da', padding: '20px', borderRadius: '8px', border: '1px solid #f5c6cb' }}>
            <h3 style={{ margin: '0 0 10px 0', color: '#721c24' }}>Out of Stock</h3>
            <p style={{ fontSize: '24px', fontWeight: 'bold', margin: '0', color: '#dc3545' }}>
              {analytics.outOfStockCount}
            </p>
          </div>
        </div>
      )}

      {/* Low Stock Alert */}
      {lowStockItems.length > 0 && (
        <div style={{ backgroundColor: '#fff3cd', border: '1px solid #ffeaa7', borderRadius: '8px', padding: '15px', marginBottom: '20px' }}>
          <h3 style={{ margin: '0 0 10px 0', color: '#856404' }}>⚠️ Low Stock Alert</h3>
          <p style={{ margin: '0', color: '#856404' }}>
            The following items need to be reordered: {lowStockItems.map(item => item.product.name).join(', ')}
          </p>
        </div>
      )}

      {/* Inventory Table */}
      <div style={{ backgroundColor: 'white', borderRadius: '8px', border: '1px solid #ddd', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ backgroundColor: '#f8f9fa' }}>
              <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Product Name</th>
              <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Supplier</th>
              <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Quantity</th>
              <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Unit Cost</th>
              <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Total Value</th>
              <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Status</th>
              <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredInventory.map((item) => {
              const stockStatus = getStockStatus(item);
              const totalValue = item.quantity * item.product.unitCost;
              
              return (
                <tr key={item.id} style={{ borderBottom: '1px solid #ddd' }}>
                  <td style={{ padding: '12px' }}>
                    <div>
                      <div style={{ fontWeight: 'bold' }}>{item.product.name}</div>
                      {item.product.description && (
                        <div style={{ fontSize: '12px', color: '#666' }}>{item.product.description}</div>
                      )}
                    </div>
                  </td>
                  <td style={{ padding: '12px' }}>{item.product.supplier.name}</td>
                  <td style={{ padding: '12px' }}>
                    <span style={{ 
                      fontWeight: 'bold',
                      color: item.quantity === 0 ? '#dc3545' : stockStatus.color 
                    }}>
                      {item.quantity.toLocaleString()}
                    </span>
                    {item.product.lowStockThreshold && (
                      <div style={{ fontSize: '12px', color: '#666' }}>
                        Min: {item.product.lowStockThreshold}
                      </div>
                    )}
                  </td>
                  <td style={{ padding: '12px' }}>${item.product.unitCost.toFixed(2)}</td>
                  <td style={{ padding: '12px' }}>${totalValue.toFixed(2)}</td>
                  <td style={{ padding: '12px' }}>
                    <span style={{
                      padding: '4px 8px',
                      borderRadius: '4px',
                      fontSize: '12px',
                      fontWeight: 'bold',
                      backgroundColor: stockStatus.color + '20',
                      color: stockStatus.color,
                    }}>
                      {stockStatus.status}
                    </span>
                  </td>
                  <td style={{ padding: '12px' }}>
                    <div style={{ display: 'flex', gap: '5px' }}>
                      <button
                        onClick={() => {
                          setSelectedItem(item);
                          setShowUpdateModal(true);
                        }}
                        style={{
                          padding: '4px 8px',
                          backgroundColor: '#007bff',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '12px',
                        }}
                      >
                        Update
                      </button>
                      <button
                        onClick={() => {
                          setSelectedItem(item);
                          setShowDispatchModal(true);
                        }}
                        style={{
                          padding: '4px 8px',
                          backgroundColor: '#dc3545',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '12px',
                        }}
                        disabled={item.quantity === 0}
                      >
                        Dispatch
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Update Quantity Modal */}
      {showUpdateModal && selectedItem && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '20px',
            borderRadius: '8px',
            width: '400px',
          }}>
            <h2>Update Inventory: {selectedItem.product.name}</h2>
            <p style={{ color: '#666', marginBottom: '20px' }}>
              Current quantity: <strong>{selectedItem.quantity}</strong>
            </p>
            <form onSubmit={handleUpdateQuantity}>
              <div style={{ marginBottom: '15px' }}>
                <label>Operation</label>
                <select
                  value={updateForm.operation}
                  onChange={(e) => setUpdateForm({ ...updateForm, operation: e.target.value as 'add' | 'subtract' | 'set' })}
                  style={{ width: '100%', padding: '8px', marginTop: '5px' }}
                >
                  <option value="add">Add Quantity</option>
                  <option value="subtract">Subtract Quantity</option>
                  <option value="set">Set Quantity</option>
                </select>
              </div>
              <div style={{ marginBottom: '15px' }}>
                <label>Quantity</label>
                <input
                  type="number"
                  required
                  value={updateForm.quantity}
                  onChange={(e) => setUpdateForm({ ...updateForm, quantity: e.target.value })}
                  style={{ width: '100%', padding: '8px', marginTop: '5px' }}
                />
              </div>
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => {
                    setShowUpdateModal(false);
                    setSelectedItem(null);
                    setUpdateForm({ quantity: '', operation: 'add' });
                  }}
                  style={{ padding: '8px 16px', border: '1px solid #ccc', backgroundColor: 'white', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ padding: '8px 16px', backgroundColor: '#007bff', color: 'white', border: 'none', cursor: 'pointer' }}
                >
                  Update
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Dispatch Modal */}
      {showDispatchModal && selectedItem && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '20px',
            borderRadius: '8px',
            width: '400px',
          }}>
            <h2>Dispatch: {selectedItem.product.name}</h2>
            <p style={{ color: '#666', marginBottom: '20px' }}>
              Current quantity: <strong>{selectedItem.quantity}</strong>
            </p>
            <form onSubmit={handleDispatch}>
              <div style={{ marginBottom: '15px' }}>
                <label>Quantity to Dispatch</label>
                <input
                  type="number"
                  required
                  max={selectedItem.quantity}
                  value={dispatchForm.quantity}
                  onChange={(e) => setDispatchForm({ ...dispatchForm, quantity: e.target.value })}
                  style={{ width: '100%', padding: '8px', marginTop: '5px' }}
                />
                <small style={{ color: '#666' }}>
                  Maximum available: {selectedItem.quantity}
                </small>
              </div>
              <div style={{ marginBottom: '15px' }}>
                <label>Reason (optional)</label>
                <textarea
                  value={dispatchForm.reason}
                  onChange={(e) => setDispatchForm({ ...dispatchForm, reason: e.target.value })}
                  placeholder="e.g., Customer order, Production use, Damage"
                  style={{ width: '100%', padding: '8px', marginTop: '5px', minHeight: '60px' }}
                />
              </div>
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => {
                    setShowDispatchModal(false);
                    setSelectedItem(null);
                    setDispatchForm({ quantity: '', reason: '' });
                  }}
                  style={{ padding: '8px 16px', border: '1px solid #ccc', backgroundColor: 'white', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ padding: '8px 16px', backgroundColor: '#dc3545', color: 'white', border: 'none', cursor: 'pointer' }}
                >
                  Dispatch
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Top Suppliers Section */}
      {analytics && analytics.topSuppliers.length > 0 && (
        <div style={{ marginTop: '30px' }}>
          <h2>Top Suppliers by Inventory Value</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
            {analytics.topSuppliers.map((supplier, index) => (
              <div key={index} style={{ 
                backgroundColor: '#f8f9fa', 
                padding: '15px', 
                borderRadius: '8px', 
                border: '1px solid #dee2e6' 
              }}>
                <h4 style={{ margin: '0 0 10px 0' }}>{supplier.supplierName}</h4>
                <p style={{ margin: '5px 0', fontSize: '14px' }}>
                  Items: <strong>{supplier.totalItems.toLocaleString()}</strong>
                </p>
                <p style={{ margin: '5px 0', fontSize: '14px' }}>
                  Value: <strong>${supplier.totalValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}</strong>
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
