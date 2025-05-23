export type Reservation = {
    reservation_id: number;
    restaurant_name: string;
    date: string;
    time: string;
    people_count: number;
    restaurant_id: number;
  };
  
  export type RootStackParamList = {
    Login: undefined;
    Register: undefined;
    Home: undefined;
    RestaurantDetails: { restaurantId: number };
    Profile: undefined;
    EditReservation: { reservation: Reservation };
  };
  