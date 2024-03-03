import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import { useForm, SubmitHandler } from 'react-hook-form';
import { Input, Button, Heading, HStack, VStack } from '@chakra-ui/react';
import { signTransaction } from '../account/AccountReducer';
type Inputs = {
  addressTo: string;
  amount: number;
};

const Transfer = () => {
  const dispatch = useAppDispatch();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Inputs>();

  const selectedAccountId = useAppSelector(
    (state) => state.accounts.selectedAccountId
  );
  const selectedAccountBalance = useAppSelector(
    (state) => state.accounts.selectedAccountBalance
  );

  const onSubmit: SubmitHandler<Inputs> = async (data) => {
    if (!selectedAccountId) return;
    const { amount, addressTo } = data;
    dispatch(
      signTransaction({
        fromAddress: selectedAccountId,
        toAddress: addressTo,
        amount,
      })
    );
  };

  return (
    <>
      <Heading size="lg" marginY={4}>
        Transfer
      </Heading>

      <form onSubmit={handleSubmit(onSubmit)}>
        <HStack>
          <VStack>
            <Input
              isInvalid={errors.addressTo ? true : false}
              errorBorderColor="red.200"
              width={'300px'}
              placeholder="Address"
              {...register('addressTo', { required: true })}
            />
            {errors.addressTo && (
              <span color="red.200">This field is required</span>
            )}
          </VStack>
          <VStack>
            <Input
              isInvalid={errors.amount ? true : false}
              errorBorderColor="red.200"
              width={'150px'}
              placeholder="Amount"
              type="number"
              {...register('amount', {
                required: true,
                min: 0,
                max: selectedAccountBalance ?? 0,
              })}
            />
            {errors.amount && <span color="red.200">Not a valid amount</span>}
          </VStack>
          <Button variant="primary" type="submit" disabled={!selectedAccountId}>
            Send
          </Button>
        </HStack>
      </form>
    </>
  );
};

export default Transfer;
