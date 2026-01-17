import { useState, useRef, useEffect } from 'react';
import api from '../api/api';

interface ParsedInvoice {
  supplierName?: string;
  items?: Array<{
    name: string;
    quantity: number;
    unitPrice: number;
    totalPrice?: number;
  }>;
  totalAmount?: number;
  date?: string;
  invoiceNumber?: string;
}

interface Supplier {
  id: number;
  name: string;
  products: Array<{
    id: number;
    name: string;
    unitCost: number;
  }>;
}

export default function InvoiceScanning() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [parsedInvoice, setParsedInvoice] = useState<ParsedInvoice | null>(null);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [matchedSuppliers, setMatchedSuppliers] = useState<Supplier[]>([]);
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [processingStep, setProcessingStep] = useState<'upload' | 'match' | 'confirm' | 'complete'>('upload');
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const fetchSuppliers = async () => {
    try {
      const response = await api.get('/invoice-scanning/suppliers');
      setSuppliers(response.data);
    } catch (err) {
      console.error('Failed to fetch suppliers');
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      setParsedInvoice(null);
      setError('');
      setSuccess('');
    }
  };

  const handleUploadAndParse = async () => {
    if (!selectedFile) return;

    setLoading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);

      const response = await api.post('/invoice-scanning/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setParsedInvoice(response.data.data);
      setProcessingStep('match');

      // Try to match suppliers
      if (response.data.data.supplierName) {
        await matchSuppliers(response.data.data.supplierName);
      }
    } catch (err) {
      setError('Failed to process invoice. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const matchSuppliers = async (supplierName: string) => {
    try {
      const response = await api.post('/invoice-scanning/match-supplier', {
        text: supplierName,
      });
      setMatchedSuppliers(response.data);
    } catch (err) {
      console.error('Failed to match suppliers');
    }
  };

  const handleSupplierSelect = (supplier: Supplier) => {
    setSelectedSupplier(supplier);
    setProcessingStep('confirm');
  };

  const handleConfirmPurchase = async () => {
    if (!parsedInvoice || !selectedSupplier) return;

    setLoading(true);
    setError('');

    try {
      const response = await api.post('/invoice-scanning/create-purchase', {
        parsedInvoice,
        supplierId: selectedSupplier.id,
      });

      setSuccess(response.data.message);
      setProcessingStep('complete');
      
      // Reset form after successful processing
      setTimeout(() => {
        resetForm();
      }, 3000);
    } catch (err) {
      setError('Failed to create purchase. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setSelectedFile(null);
    setPreviewUrl('');
    setParsedInvoice(null);
    setSelectedSupplier(null);
    setMatchedSuppliers([]);
    setProcessingStep('upload');
    setError('');
    setSuccess('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRetakePhoto = () => {
    resetForm();
  };

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h1>Invoice Scanning</h1>
      <p style={{ color: '#666', marginBottom: '30px' }}>
        Take a photo or upload an invoice to automatically create purchase orders and update inventory.
      </p>

      {/* Error and Success Messages */}
      {error && (
        <div style={{
          backgroundColor: '#f8d7da',
          color: '#721c24',
          padding: '12px',
          borderRadius: '4px',
          marginBottom: '20px',
          border: '1px solid #f5c6cb'
        }}>
          ❌ {error}
        </div>
      )}

      {success && (
        <div style={{
          backgroundColor: '#d4edda',
          color: '#155724',
          padding: '12px',
          borderRadius: '4px',
          marginBottom: '20px',
          border: '1px solid #c3e6cb'
        }}>
          ✅ {success}
        </div>
      )}

      {/* Step 1: Upload */}
      {processingStep === 'upload' && (
        <div>
          <div style={{
            border: '2px dashed #ddd',
            borderRadius: '8px',
            padding: '40px',
            textAlign: 'center',
            backgroundColor: '#f8f9fa',
            marginBottom: '20px'
          }}>
            {previewUrl ? (
              <div>
                <img
                  src={previewUrl}
                  alt="Invoice preview"
                  style={{
                    maxWidth: '100%',
                    maxHeight: '400px',
                    borderRadius: '8px',
                    marginBottom: '20px'
                  }}
                />
                <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                  <button
                    onClick={handleUploadAndParse}
                    disabled={loading}
                    style={{
                      padding: '12px 24px',
                      backgroundColor: loading ? '#6c757d' : '#007bff',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: loading ? 'not-allowed' : 'pointer',
                      fontSize: '16px'
                    }}
                  >
                    {loading ? 'Processing...' : 'Process Invoice'}
                  </button>
                  <button
                    onClick={handleRetakePhoto}
                    style={{
                      padding: '12px 24px',
                      backgroundColor: '#6c757d',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '16px'
                    }}
                  >
                    Retake Photo
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <div style={{ fontSize: '48px', marginBottom: '20px' }}>📄</div>
                <h3>Upload Invoice Image</h3>
                <p style={{ color: '#666', marginBottom: '20px' }}>
                  Take a clear photo of the invoice or upload an image file
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handleFileSelect}
                  style={{ display: 'none' }}
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  style={{
                    padding: '12px 24px',
                    backgroundColor: '#007bff',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '16px'
                  }}
                >
                  Take Photo / Upload
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Step 2: Match Supplier */}
      {processingStep === 'match' && parsedInvoice && (
        <div>
          <h2>📋 Parsed Invoice Details</h2>
          <div style={{
            backgroundColor: '#f8f9fa',
            padding: '20px',
            borderRadius: '8px',
            marginBottom: '20px'
          }}>
            <div style={{ marginBottom: '15px' }}>
              <strong>Supplier:</strong> {parsedInvoice.supplierName || 'Not detected'}
            </div>
            <div style={{ marginBottom: '15px' }}>
              <strong>Date:</strong> {parsedInvoice.date || 'Not detected'}
            </div>
            <div style={{ marginBottom: '15px' }}>
              <strong>Invoice Number:</strong> {parsedInvoice.invoiceNumber || 'Not detected'}
            </div>
            <div style={{ marginBottom: '15px' }}>
              <strong>Total Amount:</strong> ${parsedInvoice.totalAmount?.toFixed(2) || 'Not detected'}
            </div>
            
            {parsedInvoice.items && parsedInvoice.items.length > 0 && (
              <div>
                <strong>Items:</strong>
                <ul style={{ marginTop: '10px', paddingLeft: '20px' }}>
                  {parsedInvoice.items.map((item, index) => (
                    <li key={index} style={{ marginBottom: '5px' }}>
                      {item.name} - Qty: {item.quantity} × ${item.unitPrice.toFixed(2)} = ${item.totalPrice?.toFixed(2)}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <h3>Match Supplier</h3>
          {matchedSuppliers.length > 0 ? (
            <div>
              <p style={{ color: '#666', marginBottom: '15px' }}>
                We found {matchedSuppliers.length} possible supplier matches. Please select the correct one:
              </p>
              <div style={{ display: 'grid', gap: '10px' }}>
                {matchedSuppliers.map((supplier) => (
                  <div
                    key={supplier.id}
                    onClick={() => handleSupplierSelect(supplier)}
                    style={{
                      border: '1px solid #ddd',
                      borderRadius: '8px',
                      padding: '15px',
                      cursor: 'pointer',
                      backgroundColor: 'white',
                      transition: 'background-color 0.2s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f0f8ff'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
                  >
                    <h4 style={{ margin: '0 0 5px 0' }}>{supplier.name}</h4>
                    <p style={{ margin: '0', color: '#666', fontSize: '14px' }}>
                      {supplier.products.length} products in system
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div>
              <p style={{ color: '#666', marginBottom: '15px' }}>
                No supplier matches found. Please select from all suppliers:
              </p>
              <div style={{ maxHeight: '200px', overflowY: 'auto', border: '1px solid #ddd', borderRadius: '4px' }}>
                {suppliers.map((supplier) => (
                  <div
                    key={supplier.id}
                    onClick={() => handleSupplierSelect(supplier)}
                    style={{
                      padding: '10px 15px',
                      borderBottom: '1px solid #eee',
                      cursor: 'pointer',
                      backgroundColor: 'white'
                    }}
                    >
                      {supplier.name}
                    </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Step 3: Confirm */}
      {processingStep === 'confirm' && parsedInvoice && selectedSupplier && (
        <div>
          <h2>🔍 Confirm Purchase Details</h2>
          <div style={{
            backgroundColor: '#f8f9fa',
            padding: '20px',
            borderRadius: '8px',
            marginBottom: '20px'
          }}>
            <div style={{ marginBottom: '15px' }}>
              <strong>Supplier:</strong> {selectedSupplier.name}
            </div>
            <div style={{ marginBottom: '15px' }}>
              <strong>Date:</strong> {parsedInvoice.date || new Date().toLocaleDateString()}
            </div>
            
            {parsedInvoice.items && parsedInvoice.items.length > 0 && (
              <div>
                <strong>Items to be added to inventory:</strong>
                <ul style={{ marginTop: '10px', paddingLeft: '20px' }}>
                  {parsedInvoice.items.map((item, index) => (
                    <li key={index} style={{ marginBottom: '8px', padding: '8px', backgroundColor: 'white', borderRadius: '4px' }}>
                      <div><strong>{item.name}</strong></div>
                      <div style={{ fontSize: '14px', color: '#666' }}>
                        Quantity: {item.quantity} | Unit Price: ${item.unitPrice.toFixed(2)} | Total: ${item.totalPrice?.toFixed(2)}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={() => setProcessingStep('match')}
              style={{
                padding: '12px 24px',
                backgroundColor: '#6c757d',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              ← Back
            </button>
            <button
              onClick={handleConfirmPurchase}
              disabled={loading}
              style={{
                padding: '12px 24px',
                backgroundColor: loading ? '#6c757d' : '#28a745',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: loading ? 'not-allowed' : 'pointer'
              }}
            >
              {loading ? 'Processing...' : '✅ Confirm Purchase'}
            </button>
          </div>
        </div>
      )}

      {/* Step 4: Complete */}
      {processingStep === 'complete' && (
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <div style={{ fontSize: '64px', marginBottom: '20px' }}>✅</div>
          <h2>Purchase Successfully Created!</h2>
          <p style={{ color: '#666', marginBottom: '30px' }}>
            The items have been added to inventory and the purchase has been recorded.
          </p>
          <button
            onClick={resetForm}
            style={{
              padding: '12px 24px',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Scan Another Invoice
          </button>
        </div>
      )}
    </div>
  );
}
