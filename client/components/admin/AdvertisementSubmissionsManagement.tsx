import React, { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "../ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Badge } from "../ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "../ui/card";
import {
  BarChart3,
  Eye,
  Trash2,
  Search,
  Mail,
  Phone,
  MapPin,
  DollarSign,
  Building2,
  Plus,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useToast } from "../ui/use-toast";

interface AdvertisementSubmission {
  _id: string;
  bannerType: string;
  fullName: string;
  email: string;
  phone: string;
  projectName: string;
  location: string;
  projectType: string;
  budget?: string;
  description: string;
  status: "new" | "viewed" | "contacted";
  createdAt: string;
  updatedAt: string;
}

interface Statistics {
  total: number;
  new: number;
  viewed: number;
  contacted: number;
  byBannerType: Array<{ _id: string; count: number }>;
}

interface AdminAdvertisementSubmissionsManagementProps {
  token: string;
}

const STATUS_COLORS: Record<string, string> = {
  new: "bg-blue-100 text-blue-800",
  viewed: "bg-yellow-100 text-yellow-800",
  contacted: "bg-green-100 text-green-800",
};

const BANNER_TYPES: Record<string, string> = {
  residential: "Residential",
  commercial: "Commercial",
  investment: "Investment",
  industrial: "Industrial",
};

export default function AdminAdvertisementSubmissionsManagement({
  token,
}: AdminAdvertisementSubmissionsManagementProps) {
  const [submissions, setSubmissions] = useState<AdvertisementSubmission[]>([]);
  const [statistics, setStatistics] = useState<Statistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [selectedSubmission, setSelectedSubmission] =
    useState<AdvertisementSubmission | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [updating, setUpdating] = useState(false);

  // Filters and search
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("");
  const [filterBannerType, setFilterBannerType] = useState<string>("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const { toast } = useToast();

  useEffect(() => {
    fetchSubmissions();
    fetchStatistics();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, filterStatus, filterBannerType, currentPage]);

  const fetchSubmissions = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: "10",
      });

      if (search) params.append("search", search);
      if (filterStatus) params.append("status", filterStatus);
      if (filterBannerType) params.append("bannerType", filterBannerType);

      const response = await fetch(
        `/api/admin/advertisement/submissions?${params}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const data = await response.json();

      if (data.success) {
        setSubmissions(data.data.submissions);
        setTotal(data.data.pagination.total);
        setTotalPages(data.data.pagination.pages);
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to fetch submissions",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error fetching submissions:", error);
      toast({
        title: "Error",
        description: "Failed to fetch submissions",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchStatistics = async () => {
    try {
      const response = await fetch("/api/admin/advertisement/statistics", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await response.json();

      if (data.success) {
        setStatistics(data.data);
      }
    } catch (error) {
      console.error("Error fetching statistics:", error);
    }
  };

  const handleViewDetails = (submission: AdvertisementSubmission) => {
    setSelectedSubmission(submission);
    setShowDetailsDialog(true);
  };

  const handleStatusChange = async (
    submissionId: string,
    newStatus: "new" | "viewed" | "contacted"
  ) => {
    try {
      setUpdating(true);
      const response = await fetch(
        `/api/admin/advertisement/submissions/${submissionId}/status`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status: newStatus }),
        }
      );

      const data = await response.json();

      if (data.success) {
        toast({
          title: "Success",
          description: "Status updated successfully",
        });
        fetchSubmissions();
        fetchStatistics();
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to update status",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error updating status:", error);
      toast({
        title: "Error",
        description: "Failed to update status",
        variant: "destructive",
      });
    } finally {
      setUpdating(false);
    }
  };

  const handleDelete = async (submissionId: string) => {
    if (!confirm("Are you sure you want to delete this submission?")) {
      return;
    }

    try {
      setDeleting(true);
      const response = await fetch(
        `/api/admin/advertisement/submissions/${submissionId}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const data = await response.json();

      if (data.success) {
        toast({
          title: "Success",
          description: "Submission deleted successfully",
        });
        fetchSubmissions();
        fetchStatistics();
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to delete submission",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error deleting submission:", error);
      toast({
        title: "Error",
        description: "Failed to delete submission",
        variant: "destructive",
      });
    } finally {
      setDeleting(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      {statistics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{statistics.total}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">New</CardTitle>
              <Plus className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-500">
                {statistics.new}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Viewed</CardTitle>
              <Eye className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-500">
                {statistics.viewed}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Contacted</CardTitle>
              <Mail className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-500">
                {statistics.contacted}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by name, email, or project..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setCurrentPage(1);
                }}
                className="pl-10"
              />
            </div>

            {/* Status Filter */}
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Status</SelectItem>
                <SelectItem value="new">New</SelectItem>
                <SelectItem value="viewed">Viewed</SelectItem>
                <SelectItem value="contacted">Contacted</SelectItem>
              </SelectContent>
            </Select>

            {/* Banner Type Filter */}
            <Select value={filterBannerType} onValueChange={setFilterBannerType}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Types</SelectItem>
                <SelectItem value="residential">Residential</SelectItem>
                <SelectItem value="commercial">Commercial</SelectItem>
                <SelectItem value="investment">Investment</SelectItem>
                <SelectItem value="industrial">Industrial</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Submissions Table */}
      <Card>
        <CardHeader>
          <CardTitle>Advertisement Submissions</CardTitle>
          <CardDescription>
            Total: {total} | Page {currentPage} of {totalPages}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin h-8 w-8 border-2 border-gray-300 border-t-red-600 rounded-full"></div>
            </div>
          ) : submissions.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No submissions found
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Project Name</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {submissions.map((submission) => (
                      <TableRow key={submission._id}>
                        <TableCell className="font-medium">
                          {submission.fullName}
                        </TableCell>
                        <TableCell className="text-sm">
                          {submission.email}
                        </TableCell>
                        <TableCell className="text-sm">
                          {submission.phone}
                        </TableCell>
                        <TableCell className="text-sm">
                          {submission.projectName}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {BANNER_TYPES[submission.bannerType] ||
                              submission.bannerType}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Select
                            value={submission.status}
                            onValueChange={(value) =>
                              handleStatusChange(
                                submission._id,
                                value as "new" | "viewed" | "contacted"
                              )
                            }
                            disabled={updating}
                          >
                            <SelectTrigger className="w-32">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="new">New</SelectItem>
                              <SelectItem value="viewed">Viewed</SelectItem>
                              <SelectItem value="contacted">
                                Contacted
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell className="text-sm">
                          {formatDate(submission.createdAt)}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleViewDetails(submission)}
                            >
                              <Eye size={16} />
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleDelete(submission._id)}
                              disabled={deleting}
                            >
                              <Trash2 size={16} />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <p className="text-sm text-gray-600">
                    Showing {(currentPage - 1) * 10 + 1} to{" "}
                    {Math.min(currentPage * 10, total)} of {total} submissions
                  </p>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        setCurrentPage(Math.max(1, currentPage - 1))
                      }
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft size={16} />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        setCurrentPage(Math.min(totalPages, currentPage + 1))
                      }
                      disabled={currentPage === totalPages}
                    >
                      <ChevronRight size={16} />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Details Dialog */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Submission Details</DialogTitle>
            <DialogDescription>
              Complete information about the advertisement submission
            </DialogDescription>
          </DialogHeader>

          {selectedSubmission && (
            <div className="space-y-4 py-4">
              {/* Personal Information */}
              <div className="space-y-3 pb-4 border-b">
                <h3 className="font-semibold text-gray-900">
                  Personal Information
                </h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500">Full Name</p>
                    <p className="font-medium">{selectedSubmission.fullName}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Email</p>
                    <p className="font-medium break-all">
                      {selectedSubmission.email}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500">Phone</p>
                    <p className="font-medium">{selectedSubmission.phone}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Status</p>
                    <Badge className={STATUS_COLORS[selectedSubmission.status]}>
                      {selectedSubmission.status}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Project Information */}
              <div className="space-y-3 pb-4 border-b">
                <h3 className="font-semibold text-gray-900">
                  Project Information
                </h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500 flex items-center gap-2">
                      <Building2 size={16} /> Project Name
                    </p>
                    <p className="font-medium">
                      {selectedSubmission.projectName}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500 flex items-center gap-2">
                      <MapPin size={16} /> Location
                    </p>
                    <p className="font-medium">{selectedSubmission.location}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Project Type</p>
                    <p className="font-medium">
                      {BANNER_TYPES[selectedSubmission.projectType] ||
                        selectedSubmission.projectType}
                    </p>
                  </div>
                  {selectedSubmission.budget && (
                    <div>
                      <p className="text-gray-500 flex items-center gap-2">
                        <DollarSign size={16} /> Budget
                      </p>
                      <p className="font-medium">
                        {selectedSubmission.budget}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Description */}
              <div className="space-y-3 pb-4 border-b">
                <h3 className="font-semibold text-gray-900">Description</h3>
                <p className="text-sm text-gray-700 whitespace-pre-wrap">
                  {selectedSubmission.description}
                </p>
              </div>

              {/* Metadata */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">Submitted On</p>
                  <p className="font-medium">
                    {formatDate(selectedSubmission.createdAt)}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500">Last Updated</p>
                  <p className="font-medium">
                    {formatDate(selectedSubmission.updatedAt)}
                  </p>
                </div>
              </div>

              {/* Contact Information Footer */}
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 text-sm">
                <p className="font-semibold text-gray-900 mb-2">
                  Contact this lead:
                </p>
                <p>
                  📧 Email:{" "}
                  <a
                    href={`mailto:${selectedSubmission.email}`}
                    className="text-red-600 font-medium hover:underline"
                  >
                    {selectedSubmission.email}
                  </a>
                </p>
                <p>
                  📞 Phone:{" "}
                  <a
                    href={`tel:${selectedSubmission.phone}`}
                    className="text-red-600 font-medium hover:underline"
                  >
                    {selectedSubmission.phone}
                  </a>
                </p>
              </div>

              {/* Close Button */}
              <Button
                onClick={() => setShowDetailsDialog(false)}
                className="w-full"
              >
                Close
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
