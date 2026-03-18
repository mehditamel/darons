"use client";

import { useState } from "react";
import { Plus, Calendar, MapPin, User, Check, Trash2, Stethoscope } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/empty-state";
import { AppointmentForm } from "@/components/sante/appointment-form";
import { toggleAppointmentCompleted, deleteMedicalAppointment } from "@/lib/actions/health";
import { formatDate } from "@/lib/utils";
import type { MedicalAppointment } from "@/types/health";

interface AppointmentListProps {
  memberId: string;
  appointments: MedicalAppointment[];
}

export function AppointmentList({ memberId, appointments }: AppointmentListProps) {
  const [formOpen, setFormOpen] = useState(false);

  const upcoming = appointments.filter(
    (a) => !a.completed && new Date(a.appointmentDate) >= new Date()
  );
  const past = appointments.filter(
    (a) => a.completed || new Date(a.appointmentDate) < new Date()
  );

  if (appointments.length === 0) {
    return (
      <>
        <EmptyState
          icon={Stethoscope}
          title="Aucun rendez-vous"
          description="Planifiez et suivez les rendez-vous médicaux."
          actionLabel="Ajouter un rendez-vous"
          onAction={() => setFormOpen(true)}
        />
        <AppointmentForm open={formOpen} onOpenChange={setFormOpen} memberId={memberId} />
      </>
    );
  }

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-muted-foreground">
          {upcoming.length} à venir, {past.length} passé{past.length > 1 ? "s" : ""}
        </p>
        <Button size="sm" onClick={() => setFormOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Ajouter
        </Button>
      </div>

      {upcoming.length > 0 && (
        <div className="space-y-3 mb-6">
          <h3 className="text-sm font-semibold text-muted-foreground">À venir</h3>
          {upcoming.map((apt) => (
            <AppointmentCard key={apt.id} appointment={apt} />
          ))}
        </div>
      )}

      {past.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-muted-foreground">Passés</h3>
          {past.map((apt) => (
            <AppointmentCard key={apt.id} appointment={apt} />
          ))}
        </div>
      )}

      <AppointmentForm open={formOpen} onOpenChange={setFormOpen} memberId={memberId} />
    </>
  );
}

function AppointmentCard({ appointment }: { appointment: MedicalAppointment }) {
  const isPast = new Date(appointment.appointmentDate) < new Date();

  return (
    <Card className={appointment.completed ? "opacity-60" : ""}>
      <CardContent className="flex items-center gap-4 p-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="font-semibold">{appointment.appointmentType}</p>
            {appointment.completed && <Badge variant="secondary">Effectué</Badge>}
            {!appointment.completed && isPast && <Badge variant="destructive">Manqué</Badge>}
          </div>
          <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {formatDate(appointment.appointmentDate, "dd/MM/yyyy HH:mm")}
            </span>
            {appointment.practitioner && (
              <span className="flex items-center gap-1">
                <User className="h-3 w-3" />
                {appointment.practitioner}
              </span>
            )}
            {appointment.location && (
              <span className="flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {appointment.location}
              </span>
            )}
          </div>
          {appointment.notes && (
            <p className="text-xs text-muted-foreground mt-1">{appointment.notes}</p>
          )}
        </div>
        <div className="flex gap-1 shrink-0">
          {!appointment.completed && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => toggleAppointmentCompleted(appointment.id, true)}
              aria-label="Marquer comme effectué"
            >
              <Check className="h-4 w-4 text-green-600" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => deleteMedicalAppointment(appointment.id)}
            aria-label="Supprimer"
          >
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
