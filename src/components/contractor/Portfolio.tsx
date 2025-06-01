
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Upload, Image, FileText, Plus, X } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

interface PortfolioItem {
  id: string;
  title: string;
  description: string;
  category: string;
  imageUrl: string;
  projectDate: string;
}

interface Certificate {
  id: string;
  name: string;
  issuer: string;
  fileUrl: string;
  issueDate: string;
}

const Portfolio: React.FC = () => {
  const [portfolioItems, setPortfolioItems] = useState<PortfolioItem[]>([
    {
      id: '1',
      title: 'Modern Villa Construction',
      description: 'Complete residential construction with modern amenities',
      category: 'Residential',
      imageUrl: '/placeholder.svg',
      projectDate: '2024-01-15'
    }
  ]);

  const [certificates, setCertificates] = useState<Certificate[]>([
    {
      id: '1',
      name: 'Building Construction License',
      issuer: 'Municipal Corporation',
      fileUrl: '#',
      issueDate: '2023-06-15'
    }
  ]);

  const [showAddItem, setShowAddItem] = useState(false);
  const [showAddCert, setShowAddCert] = useState(false);
  const [newItem, setNewItem] = useState({
    title: '',
    description: '',
    category: '',
    imageUrl: '',
    projectDate: ''
  });
  const [newCert, setNewCert] = useState({
    name: '',
    issuer: '',
    fileUrl: '',
    issueDate: ''
  });

  const handleAddPortfolioItem = () => {
    if (!newItem.title || !newItem.description) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    const item: PortfolioItem = {
      id: Date.now().toString(),
      ...newItem
    };

    setPortfolioItems(prev => [...prev, item]);
    setNewItem({
      title: '',
      description: '',
      category: '',
      imageUrl: '',
      projectDate: ''
    });
    setShowAddItem(false);
    
    toast({
      title: "Portfolio Item Added",
      description: "Your portfolio has been updated successfully.",
    });
  };

  const handleAddCertificate = () => {
    if (!newCert.name || !newCert.issuer) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    const cert: Certificate = {
      id: Date.now().toString(),
      ...newCert
    };

    setCertificates(prev => [...prev, cert]);
    setNewCert({
      name: '',
      issuer: '',
      fileUrl: '',
      issueDate: ''
    });
    setShowAddCert(false);
    
    toast({
      title: "Certificate Added",
      description: "Your certificate has been added successfully.",
    });
  };

  const removePortfolioItem = (id: string) => {
    setPortfolioItems(prev => prev.filter(item => item.id !== id));
    toast({
      title: "Item Removed",
      description: "Portfolio item has been removed.",
    });
  };

  const removeCertificate = (id: string) => {
    setCertificates(prev => prev.filter(cert => cert.id !== id));
    toast({
      title: "Certificate Removed",
      description: "Certificate has been removed.",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Portfolio & Documents</h2>
      </div>

      {/* Portfolio Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Image className="h-5 w-5" />
              Project Portfolio
            </CardTitle>
            <Button onClick={() => setShowAddItem(true)} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Project
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Add New Item Form */}
          {showAddItem && (
            <div className="mb-6 p-4 border rounded-lg bg-gray-50">
              <h3 className="font-medium mb-4">Add New Portfolio Item</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Project Title *</Label>
                  <Input
                    id="title"
                    value={newItem.title}
                    onChange={(e) => setNewItem(prev => ({...prev, title: e.target.value}))}
                    placeholder="Enter project title"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Input
                    id="category"
                    value={newItem.category}
                    onChange={(e) => setNewItem(prev => ({...prev, category: e.target.value}))}
                    placeholder="e.g., Residential, Commercial"
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    value={newItem.description}
                    onChange={(e) => setNewItem(prev => ({...prev, description: e.target.value}))}
                    placeholder="Describe the project"
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="imageUrl">Image URL</Label>
                  <Input
                    id="imageUrl"
                    value={newItem.imageUrl}
                    onChange={(e) => setNewItem(prev => ({...prev, imageUrl: e.target.value}))}
                    placeholder="https://example.com/image.jpg"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="projectDate">Project Date</Label>
                  <Input
                    id="projectDate"
                    type="date"
                    value={newItem.projectDate}
                    onChange={(e) => setNewItem(prev => ({...prev, projectDate: e.target.value}))}
                  />
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                <Button onClick={handleAddPortfolioItem}>Add Item</Button>
                <Button variant="outline" onClick={() => setShowAddItem(false)}>Cancel</Button>
              </div>
            </div>
          )}

          {/* Portfolio Items Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {portfolioItems.map((item) => (
              <div key={item.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="relative">
                  <img
                    src={item.imageUrl || '/placeholder.svg'}
                    alt={item.title}
                    className="w-full h-32 object-cover rounded-lg"
                  />
                  <button
                    onClick={() => removePortfolioItem(item.id)}
                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
                <div className="mt-3">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium">{item.title}</h3>
                    {item.category && (
                      <Badge variant="secondary" className="text-xs">
                        {item.category}
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 line-clamp-2">{item.description}</p>
                  {item.projectDate && (
                    <p className="text-xs text-gray-500 mt-2">
                      {new Date(item.projectDate).toLocaleDateString('en-IN')}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>

          {portfolioItems.length === 0 && !showAddItem && (
            <div className="text-center py-8">
              <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No portfolio items yet. Add your first project to showcase your work.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Certificates Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Certificates & Licenses
            </CardTitle>
            <Button onClick={() => setShowAddCert(true)} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Certificate
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Add New Certificate Form */}
          {showAddCert && (
            <div className="mb-6 p-4 border rounded-lg bg-gray-50">
              <h3 className="font-medium mb-4">Add New Certificate</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="certName">Certificate Name *</Label>
                  <Input
                    id="certName"
                    value={newCert.name}
                    onChange={(e) => setNewCert(prev => ({...prev, name: e.target.value}))}
                    placeholder="Certificate name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="issuer">Issuing Authority *</Label>
                  <Input
                    id="issuer"
                    value={newCert.issuer}
                    onChange={(e) => setNewCert(prev => ({...prev, issuer: e.target.value}))}
                    placeholder="Who issued this certificate"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fileUrl">Document URL</Label>
                  <Input
                    id="fileUrl"
                    value={newCert.fileUrl}
                    onChange={(e) => setNewCert(prev => ({...prev, fileUrl: e.target.value}))}
                    placeholder="Link to certificate document"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="issueDate">Issue Date</Label>
                  <Input
                    id="issueDate"
                    type="date"
                    value={newCert.issueDate}
                    onChange={(e) => setNewCert(prev => ({...prev, issueDate: e.target.value}))}
                  />
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                <Button onClick={handleAddCertificate}>Add Certificate</Button>
                <Button variant="outline" onClick={() => setShowAddCert(false)}>Cancel</Button>
              </div>
            </div>
          )}

          {/* Certificates List */}
          <div className="space-y-3">
            {certificates.map((cert) => (
              <div key={cert.id} className="border rounded-lg p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <FileText className="h-8 w-8 text-blue-600" />
                  <div>
                    <h3 className="font-medium">{cert.name}</h3>
                    <p className="text-sm text-gray-600">{cert.issuer}</p>
                    {cert.issueDate && (
                      <p className="text-xs text-gray-500">
                        Issued: {new Date(cert.issueDate).toLocaleDateString('en-IN')}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  {cert.fileUrl && cert.fileUrl !== '#' && (
                    <Button variant="outline" size="sm" asChild>
                      <a href={cert.fileUrl} target="_blank" rel="noopener noreferrer">
                        View
                      </a>
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => removeCertificate(cert.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {certificates.length === 0 && !showAddCert && (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No certificates added yet. Add your licenses and certifications.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Portfolio;
