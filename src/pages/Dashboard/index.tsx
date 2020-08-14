import React, { useState, useEffect, useCallback } from 'react';

import Header from '../../components/Header';

import api from '../../services/api';

import Food from '../../components/Food';
import ModalAddFood from '../../components/ModalAddFood';
import ModalEditFood from '../../components/ModalEditFood';

import { FoodsContainer } from './styles';

interface IFoodPlate {
  id: number;
  name: string;
  image: string;
  price: string;
  description: string;
  available: boolean;
}

const Dashboard: React.FC = () => {
  const [foods, setFoods] = useState<IFoodPlate[]>([]);
  const [editingFood, setEditingFood] = useState<IFoodPlate>({} as IFoodPlate);
  const [modalOpen, setModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);

  useEffect(() => {
    async function loadFoods(): Promise<void> {
      // TODO LOAD FOODS
      const response = await api.get<IFoodPlate[]>('/foods');

      setFoods(response.data);
    }

    loadFoods();
  }, []);

  const handleAddFood = useCallback(
    async (food: Omit<IFoodPlate, 'id' | 'available'>): Promise<void> => {
      try {
        Object.assign(food, {
          available: true,
        });
        const response = await api.post('/foods', food);

        setFoods(oldFoods => [...oldFoods, response.data]);
      } catch (err) {
        // eslint-disable-next-line
        console.log(err);
      }
    },
    [],
  );

  const handleUpdateFood = useCallback(
    async (food: Omit<IFoodPlate, 'id' | 'available'>): Promise<void> => {
      Object.assign(food, {
        available: editingFood.available,
      });

      const response = await api.put<IFoodPlate>(
        `/foods/${editingFood.id}`,
        food,
      );

      setFoods(oldFoods =>
        oldFoods.map(f => (f.id === response.data.id ? response.data : f)),
      );
    },
    [editingFood],
  );

  const handleDeleteFood = useCallback(async (id: number): Promise<void> => {
    await api.delete(`/foods/${id}`);

    setFoods(oldFoods => oldFoods.filter(food => food.id !== id));
  }, []);

  const toggleModal = useCallback((): void => {
    setModalOpen(modalOpenData => !modalOpenData);
  }, []);

  const toggleEditModal = useCallback((): void => {
    setEditModalOpen(editModalOpenData => !editModalOpenData);
  }, []);

  const handleEditFood = useCallback(
    (food: IFoodPlate): void => {
      setEditingFood(food);
      toggleEditModal();
    },
    [toggleEditModal],
  );
  return (
    <>
      <Header openModal={toggleModal} />
      <ModalAddFood
        isOpen={modalOpen}
        setIsOpen={toggleModal}
        handleAddFood={handleAddFood}
      />
      <ModalEditFood
        isOpen={editModalOpen}
        setIsOpen={toggleEditModal}
        editingFood={editingFood}
        handleUpdateFood={handleUpdateFood}
      />

      <FoodsContainer data-testid="foods-list">
        {foods &&
          foods.map(food => (
            <Food
              key={food.id}
              food={food}
              handleDelete={handleDeleteFood}
              handleEditFood={handleEditFood}
            />
          ))}
      </FoodsContainer>
    </>
  );
};

export default Dashboard;
