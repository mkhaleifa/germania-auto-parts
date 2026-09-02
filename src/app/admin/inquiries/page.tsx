"use client"
import { useCallback , useEffect , useState } from "react"
import { useRouter , useSearchParams } from "next/navigation"
import {
  Search,
  Mail,
  MessageCircle,
  X,
  CheckCircle,
  Clock,
  Eye,
  MessageSquare,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { string } from "zod";

interface Inquiry {
    id: string;
    name: string;
    email: string;
    phone: string | null;
    subject: string;
    message: string;
    status: string;
    adminNote: string | null;
    createdAt: string;
}
const STATUS_CONFIG:  Record<string, { label: string; variant: "default" | "secondary" | "outline" | "destructive"; icon: React.ReactNode }> = {
  UNREAD: { label: "Unread", variant: "destructive", icon: <Clock className="h-3 w-3" /> },
  READ: { label: "Read", variant: "secondary", icon: <Eye className="h-3 w-3" /> },
  REPLIED: { label: "Replied", variant: "outline", icon: <MessageSquare className="h-3 w-3" /> },
  RESOLVED: { label: "Resolved", variant: "default", icon: <CheckCircle className="h-3 w-3" /> },
}
export default function AdminInquiriesPage(){

    const router = useRouter()
    const searchParams = useSearchParams()
    const [inquiries, setInquiries] = useState<Inquiry[]>([])
    const [loading, setLoading] = useState(true)
    const [totalPages , setTotalPages] = useState(0)
    const [search , setSearch] = useState(searchParams.get("search")|| "")
    const [statusFilter, setStatusFilter] = useState(searchParams.get("status") || "ALL");
    const [selected, setSelected] = useState<Inquiry | null>(null);
    const [adminNote, setAdminNote] = useState("");
    const [updatingStatus, setUpdatingStatus] = useState(false);

    const page = Number(searchParams.get('page') || 1)

    const fetchInquiries = useCallback(async ()=> {
        setLoading(true)
        const params = new URLSearchParams()
        params.set('page', String(page))
        if(search) params.set('search',search)
        if(statusFilter !== 'ALL') params.set('status', statusFilter)
        
        try{
            const res = await fetch(`/api/admin/inquiries?${params}`);
            const result = await res.json();
            setInquiries(result.data || []);
            setTotalPages(result.pagination?.totalPages || 0);

        }
        catch{
            toast.error("Failed to load inquiries")
        }
        finally{
            setLoading(false)
        }
    }
    ,[page,search,statusFilter])

    useEffect(()=>{
        fetchInquiries()
    },[fetchInquiries])

    function updateURL(updates: Record<string, string>){
        const params = new URLSearchParams(searchParams.toString())
        Object.entries(updates).forEach(([k,v])=>{
            if(v) params.set(k,v)
            else params.delete(k)
        })
        params.set("page", "1");
        router.push(`/admin/inquiries?${params}`);
    }

    function handleSearch(e: React.FormEvent){
        e.preventDefault()
        updateURL({search})
    }

    function handleStatusFilter(value: string | null){
        if(!value) return 
        setStatusFilter(value)
        updateURL({ status: value === "ALL" ? "" : value });
    }

     function openDetail(inquiry: Inquiry) {
    setSelected(inquiry);
    setAdminNote(inquiry.adminNote || "");
    // Auto-mark as READ if UNREAD
    if (inquiry.status === "UNREAD") {
      updateInquiryStatus(inquiry.id, "READ", inquiry.adminNote || "");
    }
  }

  async function updateInquiryStatus(id:string , status:string , note?:string) {
    setUpdatingStatus(true)
     try {
      const res = await fetch(`/api/admin/inquiries/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, adminNote: note }),
      });
      if (!res.ok) throw new Error();
      toast.success("Inquiry updated");
      fetchInquiries();
      if (selected?.id === id) {
        setSelected((prev) => prev ? { ...prev, status, adminNote: note || null } : null);
      }
    } catch {
      toast.error("Failed to update inquiry");
    } finally {
      setUpdatingStatus(false);
    }
  }

  function handleSaveNote() {
    if (!selected) return;
    updateInquiryStatus(selected.id, selected.status, adminNote);
  }

  function handleReplyEmail(inquiry: Inquiry) {
    const subject = encodeURIComponent(`Re: ${inquiry.subject}`);
    window.open(`mailto:${inquiry.email}?subject=${subject}`, "_blank");
  }

  function handleReplyWhatsApp(inquiry: Inquiry) {
    if (!inquiry.phone) {
      toast.error("No phone number available");
      return;
    }
    const phone = inquiry.phone.replace(/[^0-9+]/g, "");
    const text = encodeURIComponent(`Hi ${inquiry.name}, regarding your inquiry about "${inquiry.subject}"`);
    window.open(`https://wa.me/${phone}?text=${text}`, "_blank");
  }


  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Customer Inquiries</h1>

      <div className="flex flex-col sm:flex-row gap-3">
        <form onSubmit={handleSearch} className="relative max-w-md flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search inquiries..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </form>
        <Select value={statusFilter} onValueChange={handleStatusFilter}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Status</SelectItem>
            <SelectItem value="UNREAD">Unread</SelectItem>
            <SelectItem value="READ">Read</SelectItem>
            <SelectItem value="REPLIED">Replied</SelectItem>
            <SelectItem value="RESOLVED">Resolved</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-8 text-center text-muted-foreground">Loading...</div>
          ) : inquiries.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">No inquiries found.</div>
          ) : (
            <>
              {/* Desktop table */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-left">
                      <th className="p-3 font-medium">Status</th>
                      <th className="p-3 font-medium">Name</th>
                      <th className="p-3 font-medium">Subject</th>
                      <th className="p-3 font-medium">Date</th>
                      <th className="p-3 font-medium text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {inquiries.map((inq) => {
                      const config = STATUS_CONFIG[inq.status] || STATUS_CONFIG.UNREAD;
                      return (
                        <tr
                          key={inq.id}
                          className="border-b last:border-0 hover:bg-muted/50 cursor-pointer"
                          onClick={() => openDetail(inq)}
                        >
                          <td className="p-3">
                            <Badge variant={config.variant} className="gap-1">
                              {config.icon}
                              {config.label}
                            </Badge>
                          </td>
                          <td className="p-3 font-medium">{inq.name}</td>
                          <td className="p-3 text-muted-foreground">{inq.subject}</td>
                          <td className="p-3 text-muted-foreground">
                            {new Date(inq.createdAt).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                            })}
                          </td>
                          <td className="p-3 text-right">
                            <Button variant="outline" size="sm">
                              View
                            </Button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Mobile cards */}
              <div className="md:hidden divide-y">
                {inquiries.map((inq) => {
                  const config = STATUS_CONFIG[inq.status] || STATUS_CONFIG.UNREAD;
                  return (
                    <button
                      key={inq.id}
                      className="w-full p-4 text-left hover:bg-muted/50"
                      onClick={() => openDetail(inq)}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium">{inq.name}</span>
                        <Badge variant={config.variant} className="gap-1 text-xs">
                          {config.icon}
                          {config.label}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{inq.subject}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(inq.createdAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </p>
                    </button>
                  );
                })}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {totalPages > 1 && (
        <div className="flex justify-center gap-1">
          {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => i + 1).map((p) => (
            <Button
              key={p}
              variant={p === page ? "default" : "outline"}
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() => {
                const params = new URLSearchParams(searchParams.toString());
                params.set("page", String(p));
                router.push(`/admin/inquiries?${params}`);
              }}
            >
              {p}
            </Button>
          ))}
        </div>
      )}

      {/* Detail Sheet */}
      <Sheet open={!!selected} onOpenChange={(open) => !open && setSelected(null)}>
        <SheetContent className="overflow-y-auto sm:max-w-lg">
          <SheetHeader>
            <SheetTitle>Inquiry Detail</SheetTitle>
          </SheetHeader>
          {selected && (
            <div className="space-y-6 py-4">
              <div className="space-y-3">
                <div>
                  <Label className="text-muted-foreground text-xs">From</Label>
                  <p className="font-medium">{selected.name}</p>
                  <p className="text-sm text-muted-foreground">{selected.email}</p>
                  {selected.phone && (
                    <p className="text-sm text-muted-foreground">{selected.phone}</p>
                  )}
                </div>
                <div>
                  <Label className="text-muted-foreground text-xs">Date</Label>
                  <p className="text-sm">
                    {new Date(selected.createdAt).toLocaleDateString("en-US", {
                      weekday: "long",
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </p>
                </div>
                <div>
                  <Label className="text-muted-foreground text-xs">Subject</Label>
                  <p className="font-medium">{selected.subject}</p>
                </div>
              </div>

              <div className="rounded-md bg-muted p-4">
                <Label className="text-muted-foreground text-xs mb-2 block">Message</Label>
                <p className="text-sm whitespace-pre-wrap">{selected.message}</p>
              </div>

              <div className="space-y-2">
                <Label>Status</Label>
                <Select
                  value={selected.status}
                  onValueChange={(value) => {
                    if (!value) return;
                    updateInquiryStatus(selected.id, value, adminNote);
                  }}
                  disabled={updatingStatus}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="UNREAD">Unread</SelectItem>
                    <SelectItem value="READ">Read</SelectItem>
                    <SelectItem value="REPLIED">Replied</SelectItem>
                    <SelectItem value="RESOLVED">Resolved</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="adminNote">Admin Note</Label>
                <Textarea
                  id="adminNote"
                  value={adminNote}
                  onChange={(e) => setAdminNote(e.target.value)}
                  placeholder="Internal note (not sent to customer)..."
                  rows={3}
                />
                <Button size="sm" variant="outline" onClick={handleSaveNote} disabled={updatingStatus}>
                  Save Note
                </Button>
              </div>

              <div className="flex flex-col gap-2">
                <Button
                  variant="outline"
                  onClick={() => handleReplyEmail(selected)}
                  className="justify-start"
                >
                  <Mail className="mr-2 h-4 w-4" />
                  Reply via Email
                </Button>
                {selected.phone && (
                  <Button
                    variant="outline"
                    onClick={() => handleReplyWhatsApp(selected)}
                    className="justify-start"
                  >
                    <MessageCircle className="mr-2 h-4 w-4" />
                    Reply via WhatsApp
                  </Button>
                )}
                {selected.status !== "RESOLVED" && (
                  <Button
                    onClick={() => updateInquiryStatus(selected.id, "RESOLVED", adminNote)}
                    disabled={updatingStatus}
                  >
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Mark as Resolved
                  </Button>
                )}
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}