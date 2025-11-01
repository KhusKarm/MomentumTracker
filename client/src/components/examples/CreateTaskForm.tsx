import CreateTaskForm from '../CreateTaskForm';

export default function CreateTaskFormExample() {
  return (
    <div className="max-w-2xl">
      <CreateTaskForm
        onSubmit={(task) => console.log('Task created:', task)}
        onCancel={() => console.log('Cancelled')}
      />
    </div>
  );
}
