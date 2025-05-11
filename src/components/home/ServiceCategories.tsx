
import { Link } from 'react-router-dom';

// Service category type
interface ServiceCategory {
  id: number;
  name: string;
  description: string;
  icon: string;
  slug: string;
}

const categories: ServiceCategory[] = [
  {
    id: 1,
    name: 'Electricians',
    description: 'Licensed professionals for all electrical needs',
    icon: '⚡️',
    slug: 'electricians',
  },
  {
    id: 2,
    name: 'Plumbers',
    description: 'Expert solutions for plumbing issues',
    icon: '🔧',
    slug: 'plumbers',
  },
  {
    id: 3,
    name: 'Architects',
    description: 'Design your dream space with professional architects',
    icon: '📐',
    slug: 'architects',
  },
  {
    id: 4,
    name: 'Construction',
    description: 'Full-service construction teams for any project',
    icon: '🏗️',
    slug: 'construction',
  },
  {
    id: 5,
    name: 'Interior Designers',
    description: 'Transform your space with expert interior design',
    icon: '🎨',
    slug: 'interior-designers',
  },
  {
    id: 6,
    name: 'Landscapers',
    description: 'Create beautiful outdoor spaces with professional landscapers',
    icon: '🌳',
    slug: 'landscapers',
  },
];

const ServiceCategories = () => {
  return (
    <section className="py-16 bg-gray-50">
      <div className="container-custom">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900">Popular Service Categories</h2>
          <p className="mt-4 text-lg text-gray-600">
            Browse professionals by service category to find the perfect match for your project
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mt-8">
          {categories.map((category) => (
            <Link
              key={category.id}
              to={`/search?category=${category.slug}`}
              className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6 flex flex-col items-center text-center group"
            >
              <div className="text-4xl mb-4">{category.icon}</div>
              <h3 className="text-xl font-semibold text-gray-900 group-hover:text-primary transition-colors mb-2">
                {category.name}
              </h3>
              <p className="text-gray-600">{category.description}</p>
              <div className="mt-4 text-primary font-medium group-hover:text-secondary transition-colors">
                Browse {category.name}
              </div>
            </Link>
          ))}
        </div>
        
        <div className="text-center mt-12">
          <Link to="/search" className="button-primary inline-block">
            View All Categories
          </Link>
        </div>
      </div>
    </section>
  );
};

export default ServiceCategories;
