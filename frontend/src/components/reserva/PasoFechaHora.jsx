import { useState, useEffect, useMemo } from 'react';
import {
    Typography,
    Grid,
    Paper,
    Box,
    Button,
    CircularProgress,
    Alert,
    Chip,
    Divider,
    IconButton,
} from '@mui/material';
import { motion } from 'framer-motion';
import { useReserva } from '../../context/ReservaContext';
import { reservaService } from '../../api/reservaService';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { 
    format, 
    startOfMonth, 
    endOfMonth, 
    eachDayOfInterval, 
    isSameMonth, 
    isToday, 
    isSameDay, 
    parseISO,
    isAfter,
    getDay,
    addMonths,
    subMonths,
    startOfWeek,
    endOfWeek,
    addDays,
    isBefore,
    addMinutes
} from 'date-fns';
import { es } from 'date-fns/locale';

// Definir el orden correcto de los días de la semana (Lunes a Domingo)
const diasSemanaOrdenado = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];

const PasoFechaHora = () => {
    const {
        peluqueroSeleccionado,
        servicioSeleccionado,
        fechaHoraSeleccionada,
        setFechaHoraSeleccionada,
    } = useReserva();

    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(null);
    const [weeklySchedule, setWeeklySchedule] = useState(null);
    const [horariosDisponibles, setHorariosDisponibles] = useState([]);
    const [loadingSchedule, setLoadingSchedule] = useState(false);
    const [loadingSlots, setLoadingSlots] = useState(false);
    const [errorSchedule, setErrorSchedule] = useState(null);
    const [errorSlots, setErrorSlots] = useState(null);
    
    const [showAllSlots, setShowAllSlots] = useState(false);
    const slotsToShowInitially = 4;

    // Cargar horario semanal al montar el componente o cambiar peluquero
    useEffect(() => {
        const fetchWeeklySchedule = async () => {
            if (!peluqueroSeleccionado) return;
            setLoadingSchedule(true);
            setErrorSchedule(null);
            try {
                console.log('Fetching weekly schedule for peluquero:', peluqueroSeleccionado.id);
                const scheduleData = await reservaService.getHorariosSemanalesByPeluqueroId(peluqueroSeleccionado.id);
                console.log('Weekly schedule data received:', scheduleData);

                // Mapear el horario a un formato accesible por día de la semana (0-6)
                // Aseguramos que weeklySchedule tenga claves para todos los días de la semana (0-6)
                const diasSemanaIndices = {
                  'Domingo': 0,
                  'Lunes': 1,
                  'Martes': 2,
                  'Miércoles': 3,
                  'Jueves': 4,
                  'Viernes': 5,
                  'Sábado': 6,
                };

                const scheduleMap = {};
                // Inicializar scheduleMap con todos los días, marcándolos como inactivos por defecto
                Object.values(diasSemanaIndices).forEach(index => {
                    scheduleMap[index] = { activo: 0 }; // Asumir inactivo a menos que los datos digan lo contrario
                });

                // Llenar scheduleMap con los datos del backend si existen
                if (scheduleData) {
                     Object.keys(scheduleData).forEach(diaNombre => {
                         const index = diasSemanaIndices[diaNombre];
                         if (index !== undefined) {
                             scheduleMap[index] = scheduleData[diaNombre];
                         }
                     });
                }
                
                console.log('Weekly schedule mapped:', scheduleMap);
                setWeeklySchedule(scheduleMap);
            } catch (error) {
                console.error('Error fetching weekly schedule:', error);
                setErrorSchedule('No se pudo cargar el horario semanal del peluquero.');
                setWeeklySchedule(null); // Reset schedule on error
            } finally {
                setLoadingSchedule(false);
            }
        };
        fetchWeeklySchedule();
    }, [peluqueroSeleccionado]);

    // Cargar horarios disponibles cuando cambia la fecha seleccionada, peluquero o servicio
    useEffect(() => {
        const fetchHorariosDisponibles = async () => {
            if (!selectedDate || !peluqueroSeleccionado || !servicioSeleccionado) {
                 setHorariosDisponibles([]); // Limpiar horarios si falta info
                 setFechaHoraSeleccionada(null); // Limpiar selección
                 console.log('Cannot fetch available slots: Missing selectedDate, peluqueroSeleccionado, or servicioSeleccionado');
                return;
            }

            console.log('Fetching available slots for:', {
                peluqueroId: peluqueroSeleccionado.id,
                fecha: format(selectedDate, 'yyyy-MM-dd'),
                servicioId: servicioSeleccionado.id,
            });

            setLoadingSlots(true);
            setErrorSlots(null);
            setShowAllSlots(false); // Reset show more state
            try {
                const formattedDate = format(selectedDate, 'yyyy-MM-dd');
                // NOTA: Esta llamada al backend debería idealmente devolver *solo* los slots
                // disponibles, considerando el horario y las reservas existentes.
                // Si solo devuelve el horario general, la generación de slots debe
                // hacerse en el frontend (como en handleDateClick).
                const data = await reservaService.getHorariosDisponibles(
                    peluqueroSeleccionado.id,
                    formattedDate,
                    servicioSeleccionado.id
                );
                console.log('Available slots data received from backend:', data);
                // Convertir strings de hora a objetos Date/LocalDateTime si es necesario, o usarlos tal cual
                // Asumimos que el backend devuelve strings de fecha y hora ISO 8601
                const fetchedSlots = data.map(slot => parseISO(slot));
                setHorariosDisponibles(fetchedSlots); // Actualizar el estado con los datos del backend
                console.log('Horarios disponibles state updated from backend data:', fetchedSlots);
                
            } catch (error) {
                console.error('Error al cargar horarios disponibles del backend:', error);
                setErrorSlots('No hay horarios disponibles para esta fecha con el servicio seleccionado.');
                setHorariosDisponibles([]);
            } finally {
                setLoadingSlots(false);
            }
        };

        // Este useEffect ahora solo carga los horarios disponibles del backend
        // La generación/filtrado basado en el horario semanal se hará en handleDateClick
        fetchHorariosDisponibles();

    }, [selectedDate, peluqueroSeleccionado, servicioSeleccionado, setFechaHoraSeleccionada]);

    // Este useEffect observa los cambios en horariosDisponibles para depuración
    useEffect(() => {
        console.log('Current horariosDisponibles state:', horariosDisponibles);
    }, [horariosDisponibles]);

    // Generar días para el calendario
    const daysInMonth = useMemo(() => {
        const start = startOfWeek(startOfMonth(currentMonth), { locale: es });
        const end = endOfWeek(endOfMonth(currentMonth), { locale: es });
        return eachDayOfInterval({ start, end });
    }, [currentMonth]);

    // Navegación del calendario
    const nextMonth = () => {
        setCurrentMonth(addMonths(currentMonth, 1));
    };

    const prevMonth = () => {
        setCurrentMonth(subMonths(currentMonth, 1));
    };

    const handleDateClick = (day) => {
        // Si la fecha está deshabilitada, no hacemos nada
        if (isDateDisabled(day)) {
            console.log('Fecha deshabilitada, no se puede seleccionar:', day);
            return;
        }

        setSelectedDate(day);
        setFechaHoraSeleccionada(null); // Reset selected time when date changes
        setShowAllSlots(false); // Reset show more state

        // Lógica para filtrar horarios según el día seleccionado y el horario semanal
        const dayIndex = getDay(day); // 0 (Domingo) - 6 (Sábado)
        const horarioDia = weeklySchedule ? weeklySchedule[dayIndex] : null; // Obtener horario del día

        if (horarioDia && horarioDia.activo === 1) {
            // Generar slots cada 30 minutos dentro del rango horario activo
            const slots = [];
            // Asumiendo que hora_inicio y hora_fin vienen en formato HH:mm
            const [inicioHora, inicioMinutos] = horarioDia.hora_inicio.split(':').map(Number);
            const [finHora, finMinutos] = horarioDia.hora_fin.split(':').map(Number);

            let current = new Date(day);
            current.setHours(inicioHora, inicioMinutos, 0, 0);
            
            const end = new Date(day);
            end.setHours(finHora, finMinutos, 0, 0);

            while (isBefore(current, end)) {
                 slots.push(new Date(current)); // Guardar como objeto Date
                 current = addMinutes(current, servicioSeleccionado.duracionEnMinutos); // Usar duración del servicio
            }

            setHorariosDisponibles(slots); // Actualizar el estado con los slots generados
            console.log('Horarios generados para el día seleccionado:', slots);

        } else {
            // Si el día no está activo o no hay horario, no hay horarios disponibles
            setHorariosDisponibles([]);
            console.log('Día no activo o sin horario, no hay horarios disponibles.');
        }
    };

    const handleTimeClick = (time) => {
        setFechaHoraSeleccionada(time); // time is already a Date object from parseISO
    };

    // Lógica para deshabilitar fechas
    const isDateDisabled = (day) => {
        const today = new Date();
        // Establecer horas, minutos, segundos y milisegundos a 0 para comparar solo la fecha
        today.setHours(0, 0, 0, 0);
        const dayStart = new Date(day);
        dayStart.setHours(0, 0, 0, 0);


        // Deshabilitar fechas pasadas
        if (isBefore(dayStart, today)) {
            return true;
        }

        // Deshabilitar días según horario semanal si ya se ha cargado
        if (!loadingSchedule && weeklySchedule) {
            // getDay returns 0 for Sunday, 1 for Monday, ..., 6 for Saturday
            const dayOfWeekIndex = getDay(day);

            // Usar directamente el índice de getDay() para acceder a weeklySchedule
            const diaHorario = weeklySchedule[dayOfWeekIndex];

            // Deshabilitar si no hay horario para este día o si activo es 0
            // La disponibilidad depende únicamente del campo 'activo'.
            if (!diaHorario || diaHorario.activo === 0) {
                 return true;
            }
        }

        return false; // Fecha habilitada por defecto
    };

    // Formatear hora para mostrar
    const formatTime = (time) => {
        return format(time, 'HH:mm', { locale: es });
    };

    // Determine slots to display based on showAllSlots state
    const slotsToDisplay = showAllSlots ? horariosDisponibles : horariosDisponibles.slice(0, slotsToShowInitially);


    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
        >
            <Typography variant="h5" align="center" gutterBottom sx={{ color: '#000000' }}>
                Selecciona Fecha y Hora
            </Typography>
            <Grid container spacing={3} sx={{ margin: 'auto' }}>
                {/* Calendario */}
                <Grid item xs={12} md={12} sx={{ display: 'block', margin: 'auto' }}>
                    <Paper elevation={0} sx={{ p: 3, border: '1px solid rgba(0, 0, 0, 0.12)', margin: 'auto' }}>
                         <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <IconButton onClick={prevMonth} aria-label="previous month">
                                <ChevronLeftIcon />
                            </IconButton>
                            <Typography variant="h6" align="center" sx={{ color: '#000000' }}>
                                {format(currentMonth, 'MMMM yyyy', { locale: es })}
                            </Typography>
                             <IconButton onClick={nextMonth} aria-label="next month">
                                <ChevronRightIcon />
                            </IconButton>
                        </Box>

                         <Grid container spacing={0} textAlign="center">
                             {/* Encabezados de los días (Lunes a Domingo) */}
                             {diasSemanaOrdenado.map(dia => (
                                 <Grid item key={dia} sx={{ width: 'calc(100% / 7)' }}>
                                     <Typography variant="caption" fontWeight="bold" sx={{ color: '#000000' }}>
                                         {dia.substring(0, 3).toUpperCase()}
                                </Typography>
                                 </Grid>
                             ))}
                         </Grid>

                         {/* Días del mes - Renderizados en columnas por día de la semana */}
                         <Grid container spacing={0} textAlign="center">
                             {diasSemanaOrdenado.map((diaNombre, diaIndex) => {
                                 // getDay(day) returns 0 for Sunday, 1 for Monday, ..., 6 for Saturday
                                 // We need to filter days based on the day of the week, adjusting for our Monday-start order
                                 const correspondingDayOfWeek = diaIndex === 6 ? 0 : diaIndex + 1; // 0=Lunes, ..., 5=Sábado, 6=Domingo (maps to getDay 1-6, 0)

                                 const daysForThisColumn = daysInMonth.filter(day => getDay(day) === correspondingDayOfWeek);

                                 return (
                                     <Grid item key={diaIndex} sx={{ width: 'calc(100% / 7)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.8 }}>
                                         {/* Aquí se renderiza cada día dentro de su columna */}
                                         {daysForThisColumn.map((day, index) => {
                                             const isCurrentMonth = isSameMonth(day, currentMonth);
                                             const disabled = isDateDisabled(day);
                                             const isSelected = selectedDate ? isSameDay(day, selectedDate) : false;
                                             const isTodayMarker = isToday(day);

                                             return (
                                                 <Box
                                                     key={index}
                                                sx={{
                                                         width: 45,
                                                         height: 45,
                                                         display: 'flex',
                                                         justifyContent: 'center',
                                                         alignItems: 'center',
                                                         borderRadius: '50%',
                                                         cursor: disabled ? 'not-allowed' : 'pointer',
                                                         backgroundColor: isSelected ? '#d72a3c' : (isTodayMarker ? 'transparent' : 'transparent'),
                                                         border: isTodayMarker && !isSelected ? '1px solid #d72a3c' : (isSelected ? '1px solid transparent' : '1px solid transparent'),
                                                         color: isSelected ? 'white' : (isCurrentMonth ? (disabled ? 'text.disabled' : '#000000') : 'text.disabled'),
                                                         fontWeight: isCurrentMonth && !disabled ? 'normal' : 'normal',
                                                         opacity: isCurrentMonth ? 1 : 0.4,
                                                         pointerEvents: disabled ? 'none' : 'auto',
                                                         transition: 'all 0.2s ease-in-out',
                                                    '&:hover': {
                                                             backgroundColor: isCurrentMonth && !disabled && !isSelected ? 'rgba(215, 42, 60, 0.1)' : undefined,
                                                         }
                                                     }}
                                                      onClick={disabled ? undefined : () => handleDateClick(day)}>
                                                     <Typography variant="body1" sx={{
                                                         color: isSelected ? 'white' : (isCurrentMonth ? (disabled ? 'text.disabled' : '#000000') : 'text.disabled'),
                                                         fontWeight: isSelected || (isCurrentMonth && !disabled) ? 'normal' : 'normal',
                                                     }}>{format(day, 'd', { locale: es })}</Typography>
                                </Box>
                                             );
                                         })}
                                     </Grid>
                                 );
                             })}
                         </Grid>
                         {loadingSchedule && <Typography variant="caption" align="center" display="block" sx={{ mt: 2 }}>Cargando horario semanal...</Typography>}
                         {errorSchedule && <Alert severity="error" size="small" sx={{ mt: 2 }}>{errorSchedule}</Alert>}
                    </Paper>
                </Grid>

                {/* Horarios disponibles */}
                {selectedDate && !loadingSlots && horariosDisponibles.length > 0 && (
                    <Paper elevation={0} sx={{ p: 3, border: '1px solid rgba(0, 0, 0, 0.12)', mt: 3 }}>
                        <Typography variant="subtitle1" gutterBottom sx={{ color: '#000000' }}>
                            Horarios disponibles para {format(selectedDate, 'EEEE, dd MMMM', { locale: es })}
                        </Typography>
                        <Divider sx={{ my: 2 }} />
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                            {slotsToDisplay.map((time, index) => (
                                <Button
                                    key={index}
                                    variant={fechaHoraSeleccionada?.getTime() === time.getTime() ? "contained" : "outlined"}
                                    onClick={() => handleTimeClick(time)}
                                    sx={{
                                        borderRadius: '20px',
                                        borderColor: fechaHoraSeleccionada?.getTime() === time.getTime() ? '#d72a3c' : 'rgba(0, 0, 0, 0.23)',
                                        color: fechaHoraSeleccionada?.getTime() === time.getTime() ? 'white' : 'black',
                                        backgroundColor: fechaHoraSeleccionada?.getTime() === time.getTime() ? '#d72a3c' : 'white',
                                        '&:hover': {
                                             backgroundColor: fechaHoraSeleccionada?.getTime() === time.getTime() ? '#c02534' : '#f0f0f0',
                                             borderColor: fechaHoraSeleccionada?.getTime() === time.getTime() ? '#c02534' : 'rgba(0, 0, 0, 0.4)',
                                        }
                                    }}
                                >
                                    {formatTime(time)}
                                </Button>
                            ))}
                             {!showAllSlots && horariosDisponibles.length > slotsToShowInitially && (
                                 <Button variant="text" onClick={() => setShowAllSlots(true)} sx={{ color: '#d72a3c' }}>
                                     Mostrar más
                                 </Button>
                            )}
                        </Box>
                    </Paper>
                )}
                 {/* Added console.log for debugging render condition */}
                 {console.log('Render condition for slots:', selectedDate, !loadingSlots, horariosDisponibles.length > 0, selectedDate && !loadingSlots && horariosDisponibles.length > 0)}

            </Grid>
        </motion.div>
    );
};

export default PasoFechaHora; 