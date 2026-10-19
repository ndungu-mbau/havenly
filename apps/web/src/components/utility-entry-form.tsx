import { Button } from "@havenly/ui/components/button";
import { Input } from "@havenly/ui/components/input";
import { Label } from "@havenly/ui/components/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@havenly/ui/components/card";
import { useState } from "react";
import { useAddOrUpdateUtility } from "@/lib/hooks/mutations";
import { Loader2, CheckCircle2 } from "lucide-react";

export function UtilityEntryForm({ house, onSuccess }: { house: any; onSuccess?: () => void }) {
  const [amount, setAmount] = useState("");
  const [period, setPeriod] = useState(new Date().toISOString().slice(0, 7));
  const addOrUpdate = useAddOrUpdateUtility();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      await addOrUpdate.mutateAsync({
        houseId: house.id,
        amount: parseInt(amount, 10),
        period: period,
      });
      setAmount("");
      onSuccess?.();
    } catch {
      // Handled in mutation onError
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor={`period-${house.id}`}>Period</Label>
          <Input
            id={`period-${house.id}`}
            type="month"
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor={`amount-${house.id}`}>Amount (KES)</Label>
          <Input
            id={`amount-${house.id}`}
            type="number"
            placeholder="0.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
          />
        </div>
      </div>
      <Button type="submit" disabled={addOrUpdate.isPending} className="w-full">
        {addOrUpdate.isPending ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <CheckCircle2 className="mr-2 h-4 w-4" />
        )}
        Save Utilities
      </Button>
    </form>
  );
}
