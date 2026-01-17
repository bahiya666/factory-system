import { useState, useEffect } from 'react';
import api from '../api/api';

interface Supplier {
  id: number;
  name: string;
  contactName?: string;
  phone?: string;
  email?: string;
  address?: string;
  notes?: string;
  products?: SupplierProduct[];
  purchases?: Purchase[];
  createdAt: string;
  updatedAt: string;
}

interface SupplierProduct {
  id: number;
  name: string;
  description?: string;
  unitCost: number;
  lowStockThreshold?: number;
  supplierId: number;
}

interface Purchase {
  id: number;
  productId: number;
  supplierId: number;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  dateBought: string;
  lastsUntil?: string;
  payments?: Payment[];
}

interface Payment {
  id: number;
  purchaseId: number;
  amountPaid: number;
  paymentDate: string;
  notes?: string;
}

export default function Suppliers() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showProductForm, setShowProductForm] = useState(false);
  const [showPurchaseForm, setShowPurchaseForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    contactName: '',
    phone: '',
    email: '',
    address: '',
    notes: '',
  });

  const [productFormData, setProductFormData] = useState({
    name: '',
    description: '',
    unitCost: '',
    lowStockThreshold: '',
  });

  const [purchaseFormData, setPurchaseFormData] = useState({
    productId: '',
    quantity: '',
    unitPrice: '',
    dateBought: '',
    lastsUntil: '',
  });

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const fetchSuppliers = async () => {
    try {
      const response = await api.get('/suppliers');
      setSuppliers(response.data);
    } catch (err) {
      setError('Failed to fetch suppliers');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSupplier = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/suppliers', formData);
      setShowCreateForm(false);
      setFormData({ name: '', contactName: '', phone: '', email: '', address: '', notes: '' });
      fetchSuppliers();
    } catch (err) {
      setError('Failed to create supplier');
    }
  };

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSupplier) return;
    
    try {
      await api.post(`/suppliers/${selectedSupplier.id}/products`, {
        ...productFormData,
        unitCost: parseFloat(productFormData.unitCost),
        lowStockThreshold: productFormData.lowStockThreshold ? parseInt(productFormData.lowStockThreshold) : undefined,
      });
      setShowProductForm(false);
      setProductFormData({ name: '', description: '', unitCost: '', lowStockThreshold: '' });
      fetchSuppliers();
    } catch (err) {
      setError('Failed to create product');
    }
  };

  const handleCreatePurchase = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSupplier) return;
    
    try {
      await api.post('/suppliers/purchases', {
        productId: parseInt(purchaseFormData.productId),
        supplierId: selectedSupplier.id,
        quantity: parseInt(purchaseFormData.quantity),
        unitPrice: parseFloat(purchaseFormData.unitPrice),
        dateBought: purchaseFormData.dateBought,
        lastsUntil: purchaseFormData.lastsUntil || undefined,
      });
      setShowPurchaseForm(false);
      setPurchaseFormData({ productId: '', quantity: '', unitPrice: '', dateBought: '', lastsUntil: '' });
      fetchSuppliers();
    } catch (err) {
      setError('Failed to create purchase');
    }
  };

  const getSupplierBalance = async (supplierId: number) => {
    try {
      const response = await api.get(`/suppliers/${supplierId}/balance`);
      return response.data;
    } catch (err) {
      console.error('Failed to get supplier balance');
      return { totalPurchased: 0, totalPaid: 0, balanceOwed: 0 };
    }
  };

  const handleUpdateQuantity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSupplier) return;

    try {
      await api.patch(`/inventory/${selectedSupplier.id}/quantity`, {
        quantity: parseInt(updateForm.quantity),
        operation: updateForm.operation,
      });
      setShowUpdateModal(false);
      setSelectedSupplier(null);
      setUpdateForm({ quantity: '', operation: 'add' });
      fetchSuppliers();
    } catch (err) {
      setError('Failed to update inventory');
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1>Supplier Management</h1>
        <button
          onClick={() => setShowCreateForm(true)}
          style={{
            padding: '10px 20px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          Add Supplier
        </button>
      </div>

      {/* Create Supplier Modal */}
      {showCreateForm && (
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
            width: '500px',
            maxHeight: '80vh',
            overflowY: 'auto',
          }}>
            <h2>Create New Supplier</h2>
            <form onSubmit={handleCreateSupplier}>
              <div style={{ marginBottom: '15px' }}>
                <label>Company Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  style={{ width: '100%', padding: '8px', marginTop: '5px' }}
                />
              </div>
              <div style={{ marginBottom: '15px' }}>
                <label>Contact Name</label>
                <input
                  type="text"
                  value={formData.contactName}
                  onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
                  style={{ width: '100%', padding: '8px', marginTop: '5px' }}
                />
              </div>
              <div style={{ marginBottom: '15px' }}>
                <label>Phone</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  style={{ width: '100%', padding: '8px', marginTop: '5px' }}
                />
              </div>
              <div style={{ marginBottom: '15px' }}>
                <label>Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  style={{ width: '100%', padding: '8px', marginTop: '5px' }}
                />
              </div>
              <div style={{ marginBottom: '15px' }}>
                <label>Address</label>
                <textarea
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  style={{ width: '100%', padding: '8px', marginTop: '5px', minHeight: '60px' }}
                />
              </div>
              <div style={{ marginBottom: '15px' }}>
                <label>Notes</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  style={{ width: '100%', padding: '8px', marginTop: '5px', minHeight: '60px' }}
                />
              </div>
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  style={{ padding: '8px 16px', border: '1px solid #ccc', backgroundColor: 'white', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ padding: '8px 16px', backgroundColor: '#007bff', color: 'white', border: 'none', cursor: 'pointer' }}
                >
                  Create Supplier
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Suppliers List */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
        {suppliers.map((supplier) => (
          <div
            key={supplier.id}
            style={{
              border: '1px solid #ddd',
              borderRadius: '8px',
              padding: '15px',
              cursor: 'pointer',
              backgroundColor: selectedSupplier?.id === supplier.id ? '#f0f8ff' : 'white',
            }}
            onClick={() => setSelectedSupplier(supplier)}
          >
            <h3 style={{ margin: '0 0 10px 0', color: '#333' }}>{supplier.name}</h3>
            {supplier.contactName && <p style={{ margin: '5px 0', fontSize: '14px' }}>Contact: {supplier.contactName}</p>}
            {supplier.phone && <p style={{ margin: '5px 0', fontSize: '14px' }}>Phone: {supplier.phone}</p>}
            {supplier.email && <p style={{ margin: '5px 0', fontSize: '14px' }}>Email: {supplier.email}</p>}
            <p style={{ margin: '10px 0 0 0', fontSize: '12px', color: '#666' }}>
              Products: {supplier.products?.length || 0} | Purchases: {supplier.purchases?.length || 0}
            </p>
          </div>
        ))}
      </div>

      {/* Supplier Details */}
      {selectedSupplier && (
        <div style={{ marginTop: '30px', border: '1px solid #ddd', borderRadius: '8px', padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2>{selectedSupplier.name} - Details</h2>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={() => setShowProductForm(true)}
                style={{ padding: '8px 16px', backgroundColor: '#28a745', color: 'white', border: 'none', cursor: 'pointer' }}
              >
                Add Product
              </button>
              <button
                onClick={() => setShowPurchaseForm(true)}
                style={{ padding: '8px 16px', backgroundColor: '#ffc107', color: 'black', border: 'none', cursor: 'pointer' }}
              >
                Add Purchase
              </button>
            </div>
          </div>

          {/* Products Section */}
          <div style={{ marginBottom: '30px' }}>
            <h3>Products</h3>
            {selectedSupplier.products && selectedSupplier.products.length > 0 ? (
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f8f9fa' }}>
                    <th style={{ padding: '10px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Product Name</th>
                    <th style={{ padding: '10px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Unit Cost</th>
                    <th style={{ padding: '10px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Low Stock Threshold</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedSupplier.products.map((product) => (
                    <tr key={product.id}>
                      <td style={{ padding: '10px', borderBottom: '1px solid #ddd' }}>{product.name}</td>
                      <td style={{ padding: '10px', borderBottom: '1px solid #ddd' }}>${product.unitCost.toFixed(2)}</td>
                      <td style={{ padding: '10px', borderBottom: '1px solid #ddd' }}>{product.lowStockThreshold || 'N/A'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p>No products found for this supplier.</p>
            )}
          </div>

          {/* Recent Purchases */}
          <div>
            <h3>Recent Purchases</h3>
            {selectedSupplier.purchases && selectedSupplier.purchases.length > 0 ? (
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f8f9fa' }}>
                    <th style={{ padding: '10px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Date</th>
                    <th style={{ padding: '10px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Quantity</th>
                    <th style={{ padding: '10px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Unit Price</th>
                    <th style={{ padding: '10px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedSupplier.purchases.slice(0, 5).map((purchase) => (
                    <tr key={purchase.id}>
                      <td style={{ padding: '10px', borderBottom: '1px solid #ddd' }}>
                        {new Date(purchase.dateBought).toLocaleDateString()}
                      </td>
                      <td style={{ padding: '10px', borderBottom: '1px solid #ddd' }}>{purchase.quantity}</td>
                      <td style={{ padding: '10px', borderBottom: '1px solid #ddd' }}>${purchase.unitPrice.toFixed(2)}</td>
                      <td style={{ padding: '10px', borderBottom: '1px solid #ddd' }}>${purchase.totalPrice.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p>No purchases found for this supplier.</p>
            )}
          </div>
        </div>
      )}

      {/* Product Form Modal */}
      {showProductForm && selectedSupplier && (
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
            width: '500px',
          }}>
            <h2>Add Product for {selectedSupplier.name}</h2>
            <form onSubmit={handleCreateProduct}>
              <div style={{ marginBottom: '15px' }}>
                <label>Product Name *</label>
                <input
                  type="text"
                  required
                  value={productFormData.name}
                  onChange={(e) => setProductFormData({ ...productFormData, name: e.target.value })}
                  style={{ width: '100%', padding: '8px', marginTop: '5px' }}
                />
              </div>
              <div style={{ marginBottom: '15px' }}>
                <label>Description</label>
                <textarea
                  value={productFormData.description}
                  onChange={(e) => setProductFormData({ ...productFormData, description: e.target.value })}
                  style={{ width: '100%', padding: '8px', marginTop: '5px', minHeight: '60px' }}
                />
              </div>
              <div style={{ marginBottom: '15px' }}>
                <label>Unit Cost *</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={productFormData.unitCost}
                  onChange={(e) => setProductFormData({ ...productFormData, unitCost: e.target.value })}
                  style={{ width: '100%', padding: '8px', marginTop: '5px' }}
                />
              </div>
              <div style={{ marginBottom: '15px' }}>
                <label>Low Stock Threshold</label>
                <input
                  type="number"
                  value={productFormData.lowStockThreshold}
                  onChange={(e) => setProductFormData({ ...productFormData, lowStockThreshold: e.target.value })}
                  style={{ width: '100%', padding: '8px', marginTop: '5px' }}
                />
              </div>
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => setShowProductForm(false)}
                  style={{ padding: '8px 16px', border: '1px solid #ccc', backgroundColor: 'white', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ padding: '8px 16px', backgroundColor: '#28a745', color: 'white', border: 'none', cursor: 'pointer' }}
                >
                  Add Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Purchase Form Modal */}
      {showPurchaseForm && selectedSupplier && (
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
            width: '500px',
          }}>
            <h2>Add Purchase for {selectedSupplier.name}</h2>
            <form onSubmit={handleCreatePurchase}>
              <div style={{ marginBottom: '15px' }}>
                <label>Product *</label>
                <select
                  required
                  value={purchaseFormData.productId}
                  onChange={(e) => setPurchaseFormData({ ...purchaseFormData, productId: e.target.value })}
                  style={{ width: '100%', padding: '8px', marginTop: '5px' }}
                >
                  <option value="">Select a product</option>
                  {selectedSupplier.products?.map((product) => (
                    <option key={product.id} value={product.id}>
                      {product.name} (${product.unitCost.toFixed(2)})
                    </option>
                  ))}
                </select>
              </div>
              <div style={{ marginBottom: '15px' }}>
                <label>Quantity *</label>
                <input
                  type="number"
                  required
                  value={purchaseFormData.quantity}
                  onChange={(e) => setPurchaseFormData({ ...purchaseFormData, quantity: e.target.value })}
                  style={{ width: '100%', padding: '8px', marginTop: '5px' }}
                />
              </div>
              <div style={{ marginBottom: '15px' }}>
                <label>Unit Price *</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={purchaseFormData.unitPrice}
                  onChange={(e) => setPurchaseFormData({ ...purchaseFormData, unitPrice: e.target.value })}
                  style={{ width: '100%', padding: '8px', marginTop: '5px' }}
                />
              </div>
              <div style={{ marginBottom: '15px' }}>
                <label>Date Bought *</label>
                <input
                  type="date"
                  required
                  value={purchaseFormData.dateBought}
                  onChange={(e) => setPurchaseFormData({ ...purchaseFormData, dateBought: e.target.value })}
                  style={{ width: '100%', padding: '8px', marginTop: '5px' }}
                />
              </div>
              <div style={{ marginBottom: '15px' }}>
                <label>Lasts Until</label>
                <input
                  type="date"
                  value={purchaseFormData.lastsUntil}
                  onChange={(e) => setPurchaseFormData({ ...purchaseFormData, lastsUntil: e.target.value })}
                  style={{ width: '100%', padding: '8px', marginTop: '5px' }}
                />
              </div>
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => setShowPurchaseForm(false)}
                  style={{ padding: '8px 16px', border: '1px solid #ccc', backgroundColor: 'white', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ padding: '8px 16px', backgroundColor: '#ffc107', color: 'black', border: 'none', cursor: 'pointer' }}
                >
                  Add Purchase
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
